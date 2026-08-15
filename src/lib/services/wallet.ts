import { db, schema } from '@/db';
import { eq, and, sql } from 'drizzle-orm';
import { generateReference } from '@/lib/utils';

export class InsufficientBalanceError extends Error {
  constructor(message = 'Insufficient balance') {
    super(message);
    this.name = 'InsufficientBalanceError';
  }
}

interface AdjustWalletOptions {
  userId: string;
  amount: number;
  reason: (typeof schema.transactionReasonEnum.enumValues)[number];
  description?: string;
  reference?: string;
  adminId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Credits a user's wallet inside a single ACID transaction. Uses a
 * `SELECT ... FOR UPDATE` row lock on the wallet so concurrent credits
 * (e.g. a webhook retry racing a manual admin credit) are serialized and
 * cannot corrupt the balance.
 *
 * Idempotent: if a transaction with the same `reference` already exists,
 * the credit is skipped and the existing transaction is returned. This
 * prevents double-crediting a wallet if a payment webhook fires more than
 * once for the same payment.
 */
export async function creditWallet(options: AdjustWalletOptions) {
  const { userId, amount, reason, description, adminId, metadata } = options;
  const reference = options.reference || generateReference();

  if (amount <= 0) {
    throw new Error('Credit amount must be greater than zero');
  }

  return db.transaction(async (tx) => {
    // Idempotency guard - skip if we've already recorded this reference.
    const existingTx = await tx.query.transactions.findFirst({
      where: eq(schema.transactions.reference, reference),
    });
    if (existingTx) {
      return { transaction: existingTx, alreadyProcessed: true as const };
    }

    // Lock the wallet row for the duration of this transaction.
    const [wallet] = await tx
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.userId, userId))
      .for('update')
      .limit(1);

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const [updatedWallet] = await tx
      .update(schema.wallets)
      .set({
        balance: sql`${schema.wallets.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(schema.wallets.id, wallet.id))
      .returning();

    const [transaction] = await tx
      .insert(schema.transactions)
      .values({
        walletId: wallet.id,
        type: 'CREDIT',
        amount: amount.toString(),
        balanceAfter: updatedWallet.balance,
        reason,
        description,
        reference,
        adminId,
        metadata,
      })
      .returning();

    return { transaction, wallet: updatedWallet, alreadyProcessed: false as const };
  });
}

/**
 * Debits a user's wallet inside a single ACID transaction. The balance
 * check and deduction happen atomically under a row lock so two concurrent
 * debits (e.g. two SMS sends firing at once) cannot both succeed against a
 * balance that only covers one of them - preventing double-spending.
 */
export async function debitWallet(options: AdjustWalletOptions) {
  const { userId, amount, reason, description, adminId, metadata } = options;
  const reference = options.reference || generateReference();

  if (amount <= 0) {
    throw new Error('Debit amount must be greater than zero');
  }

  return db.transaction(async (tx) => {
    const existingTx = await tx.query.transactions.findFirst({
      where: eq(schema.transactions.reference, reference),
    });
    if (existingTx) {
      return { transaction: existingTx, alreadyProcessed: true as const };
    }

    const [wallet] = await tx
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.userId, userId))
      .for('update')
      .limit(1);

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Atomic guard: only update if balance >= amount. If another concurrent
    // debit already dropped the balance below the threshold, this returns
    // zero rows and we throw InsufficientBalanceError.
    const [updatedWallet] = await tx
      .update(schema.wallets)
      .set({
        balance: sql`${schema.wallets.balance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.wallets.id, wallet.id),
          sql`${schema.wallets.balance} >= ${amount}`
        )
      )
      .returning();

    if (!updatedWallet) {
      throw new InsufficientBalanceError(
        `Required GH₵${amount.toFixed(2)}, available GH₵${parseFloat(wallet.balance).toFixed(2)}`
      );
    }

    const [transaction] = await tx
      .insert(schema.transactions)
      .values({
        walletId: wallet.id,
        type: 'DEBIT',
        amount: amount.toString(),
        balanceAfter: updatedWallet.balance,
        reason,
        description,
        reference,
        adminId,
        metadata,
      })
      .returning();

    return { transaction, wallet: updatedWallet, alreadyProcessed: false as const };
  });
}
