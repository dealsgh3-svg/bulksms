'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Zap,
  Shield,
  CreditCard,
  BarChart3,
  Globe,
  Clock,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Send,
  Users,
  Star,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Send thousands of SMS in seconds with our optimized delivery network across MTN, Telecel, and AT.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and secure prepaid wallet system with full transaction tracking.',
    },
    {
      icon: CreditCard,
      title: 'Pay As You Go',
      description: 'No subscriptions. Top up your wallet with MTN MoMo, Telecel Cash, or bank transfer and pay only for what you send.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track delivery rates, network performance, and campaign metrics in real-time.',
    },
    {
      icon: Globe,
      title: 'All Ghana Networks',
      description: 'Reach customers on MTN, Telecel, and AT with intelligent network routing.',
    },
    {
      icon: Clock,
      title: 'Scheduled Delivery',
      description: 'Plan your campaigns in advance with flexible scheduling for optimal timing.',
    },
  ];

  const pricingTiers = [
    {
      name: 'Standard',
      price: '0.05',
      description: 'Perfect for small businesses and startups in Ghana.',
      features: [
        'Pay-as-you-go pricing',
        'All Ghana networks (MTN, Telecel, AT)',
        'Real-time delivery reports',
        'Basic sender ID',
        'CSV contact import',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Business',
      price: '0.04',
      description: 'For growing businesses with higher volume needs.',
      features: [
        'Volume discount pricing',
        'Priority network routing',
        'Advanced analytics dashboard',
        'Multiple sender IDs',
        'API access',
        'Webhook notifications',
        'Contact groups & tags',
        'Priority support',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '0.035',
      description: 'Custom solutions for large-scale SMS operations.',
      features: [
        'Best volume rates',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options',
        'SLA guarantee',
        '24/7 phone support',
        'Advanced API features',
        'Custom reporting',
      ],
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: 'Ama Mensah',
      role: 'CEO',
      company: 'Kente Fashion GH',
      content: 'TextFlow Pro transformed how we communicate with our customers. The pay-as-you-go model is perfect for our business.',
      avatar: 'AM',
    },
    {
      name: 'Kwame Asante',
      role: 'Operations Manager',
      company: 'Accra Logistics',
      content: 'Reliable delivery to all networks. The real-time tracking helps us ensure our customers get their delivery notifications.',
      avatar: 'KA',
    },
    {
      name: 'Abena Owusu',
      role: 'Marketing Director',
      company: 'Gold Coast Retail',
      content: 'We switched from our old provider and never looked back. Better rates and excellent customer service.',
      avatar: 'AO',
    },
  ];

  const stats = [
    { value: '50M+', label: 'SMS Delivered' },
    { value: '99.5%', label: 'Delivery Rate' },
    { value: '3', label: 'Networks Covered' },
    { value: '2,000+', label: 'Businesses' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: '#006B3F' }}
              >
                <Send className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">TextFlow Pro</span>
            </div>

            <div className="hidden md:flex md:items-center md:gap-8">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                API Docs
              </Link>
            </div>

            <div className="hidden md:flex md:items-center md:gap-4">
              <ThemeToggle />
              <Link href="/login" className="text-sm font-medium hover:text-foreground transition-colors">
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: '#006B3F' }}
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="space-y-4 p-4">
              <Link href="#features" className="block text-sm font-medium">
                Features
              </Link>
              <Link href="#pricing" className="block text-sm font-medium">
                Pricing
              </Link>
              <Link href="/docs" className="block text-sm font-medium">
                API Docs
              </Link>
              <div className="pt-4 border-t space-y-2">
                <Link href="/login" className="block text-sm font-medium">
                  Sign In
                </Link>
                <Link href="/register" className="block w-full text-center">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 pattern-grid opacity-50" />
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: '#006B3F20' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: '#FCD11620' }}
        />
        
        <motion.div
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.div variants={fadeIn} className="mb-6">
              <span 
                className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
                style={{ backgroundColor: '#006B3F10', borderColor: '#006B3F30', color: '#006B3F' }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#006B3F' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#006B3F' }} />
                </span>
                Now serving all major Ghana networks
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Bulk SMS for{' '}
              <span style={{ color: '#006B3F' }}>Ghanaian Businesses</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Send SMS to MTN, Telecel, and AT customers across Ghana. 
              Pay only for what you send — no subscriptions, no hidden fees.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-lg px-8 py-3 text-base font-medium text-white transition-colors shadow-lg"
                  style={{ backgroundColor: '#006B3F' }}
                >
                  Create Free Account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-8 py-3 text-base font-medium hover:bg-accent transition-colors"
                >
                  Sign In
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            variants={fadeIn}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeIn} className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </motion.h2>
            <motion.p variants={fadeIn} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Ghanaian businesses to reach customers reliably and affordably.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeIn}
                whileHover={{ y: -6 }}
                className="group p-6 rounded-xl border bg-card hover:shadow-xl transition-all"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: '#006B3F10' }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: '#006B3F' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Get started in minutes, not hours</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up for free and get instant access to our dashboard.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Top Up Wallet',
                description: 'Add funds using MTN MoMo, Telecel Cash, or bank transfer.',
                icon: CreditCard,
              },
              {
                step: '03',
                title: 'Start Sending',
                description: 'Send SMS via our dashboard or integrate with your app using our API.',
                icon: Send,
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div 
                  className="text-8xl font-bold absolute -top-4 -left-2"
                  style={{ color: '#006B3F10' }}
                >
                  {item.step}
                </div>
                <div className="relative pt-12">
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-white mb-4"
                    style={{ backgroundColor: index === 1 ? '#FCD116' : '#006B3F', color: index === 1 ? '#000' : '#fff' }}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">Pay only for what you send. No monthly fees, no subscriptions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-8 ${
                  tier.popular ? 'ring-2' : 'bg-card'
                }`}
                style={tier.popular ? { borderColor: '#006B3F', boxShadow: '0 0 0 2px #006B3F' } : {}}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span 
                      className="inline-flex items-center gap-1 rounded-full px-4 py-1 text-sm font-medium text-white"
                      style={{ backgroundColor: '#006B3F' }}
                    >
                      <Star className="h-3 w-3" /> Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                </div>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">GH₵{tier.price}</span>
                  <span className="text-muted-foreground">/SMS</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: '#006B3F' }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/register"
                  className={`block w-full text-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    tier.popular
                      ? 'text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  style={tier.popular ? { backgroundColor: '#006B3F' } : {}}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trusted by Ghanaian Businesses</h2>
            <p className="text-lg text-muted-foreground">See what our customers have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="p-6 rounded-xl border bg-card"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4" style={{ fill: '#FCD116', color: '#FCD116' }} />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-full font-medium"
                    style={{ backgroundColor: '#006B3F20', color: '#006B3F' }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div 
            className="relative rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#006B3F' }}
          >
            <div className="relative px-8 py-16 sm:px-16 sm:py-20">
              <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-white/80 mb-8">
                  Join thousands of Ghanaian businesses using TextFlow Pro to connect with their customers. 
                  Create your free account today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium transition-colors"
                    style={{ color: '#006B3F' }}
                  >
                    Create Free Account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div 
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: '#006B3F' }}
                >
                  <Send className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">TextFlow Pro</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ghana&apos;s trusted bulk SMS platform for businesses of all sizes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/developer" className="hover:text-foreground">API</Link></li>
                <li><Link href="/docs" className="hover:text-foreground">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 TextFlow Pro. All rights reserved. Made in Ghana 🇬🇭
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/233241234567"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg hover:scale-110 transition-transform"
        style={{ backgroundColor: '#25D366' }}
      >
        <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
