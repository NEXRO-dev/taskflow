'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Zap, 
  Brain, 
  Mic, 
  Calendar, 
  Trophy, 
  Users, 
  CheckCircle, 
  Star,
  ArrowRight,
  Play,
  Sparkles,
  Target,
  Clock,
  Shield,
  Globe,
  Smartphone,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const features = [
    {
      icon: Brain,
      title: 'AI搭載タスク生成',
      description: 'インテリジェントなAIアシスタントが複雑なタスクを実行可能なサブタスクに自動分解します。',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: Mic,
      title: '音声タスク入力',
      description: '自然な音声でタスクを追加。AIが文脈、日付、優先度を理解して自動設定します。',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Trophy,
      title: 'ゲーミフィケーション',
      description: 'XPを獲得し、実績をアンロックして、魅力的な報酬システムで生産性をレベルアップ。',
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: Calendar,
      title: 'スマートスケジューリング',
      description: 'ドラッグ&ドロップでの再スケジュールと競合検出機能付きのインテリジェントなカレンダー統合。',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: Users,
      title: 'チーム連携',
      description: 'チームとシームレスに連携し、タスクを割り当て、リアルタイムで進捗を追跡できます。',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      icon: Globe,
      title: '300以上の連携',
      description: 'Slack、Notion、Google カレンダーなど、お気に入りのツールと連携できます。',
      color: 'from-cyan-500 to-blue-600'
    }
  ];

  const testimonials = [
    {
      name: '田中 美智子',
      role: 'テックコープ　プロダクトマネージャー',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'FlowCraft Proでチームのプロジェクト管理が劇的に変わりました。AIのサブタスク生成機能で毎週数時間の節約になっています。',
      rating: 5
    },
    {
      name: '山田 健一',
      role: 'フリーランスデザイナー',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: '音声入力機能は本当に画期的です。運転中や歩きながらでもタスクを追加できるので、思いついたことを逃しません。',
      rating: 5
    },
    {
      name: '佐藤 恵美',
      role: 'スタートアップ創業者',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'ついに私の働き方を理解してくれるタスク管理ツールに出会えました。ゲーミフィケーションのおかげで毎日モチベーションを保てています。',
      rating: 5
    }
  ];

  const plans = [
    {
      name: '無料',
      price: '¥0',
      period: '永久',
      description: 'まずは始めたい方に最適',
      features: [
        '最大50タスク',
        '基本的なAIサブタスク',
        '音声入力',
        'カレンダー表示',
        'モバイルアプリ'
      ],
      cta: '無料で始める',
      popular: false
    },
    {
      name: 'プロ',
      price: '¥2,980',
      period: '月額',
      description: 'パワーユーザー・プロフェッショナル向け',
      features: [
        '無制限タスク',
        '高度なAI機能',
        'チーム連携（5名まで）',
        '優先サポート',
        '高度な分析機能',
        '100以上の連携',
        'カスタムワークフロー'
      ],
      cta: 'プロ版トライアル',
      popular: true
    },
    {
      name: 'チーム',
      price: '¥4,480',
      period: '月額',
      description: '成長するチーム向け',
      features: [
        'プロ版の全機能',
        '最大10名のチームメンバー',
        '高度なチーム分析',
        'カスタムブランディング',
        '管理者コントロール',
        'SSO統合'
      ],
      cta: 'チーム版トライアル',
      popular: false
    },
    {
      name: 'ビジネス',
      price: '¥29,800',
      period: '月額',
      description: '大規模組織向け',
      features: [
        'チーム版の全機能',
        '最大100ユーザー',
        'エンタープライズセキュリティ',
        'カスタム統合',
        '専任サポート',
        'SLA保証'
      ],
      cta: '営業に問い合わせ',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <motion.nav 
        className="glass sticky top-0 z-50 border-b border-white/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <Zap className="h-8 w-8 text-primary fill-current" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FlowCraft Pro</h1>
                <p className="text-xs text-gray-600">次世代生産性プラットフォーム</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">機能</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">料金</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">レビュー</a>
              <Link 
                href="/sign-in"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                ログイン
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 space-y-4"
            >
              <a href="#features" className="block text-gray-600 hover:text-gray-900 transition-colors">機能</a>
              <a href="#pricing" className="block text-gray-600 hover:text-gray-900 transition-colors">料金</a>
              <a href="#testimonials" className="block text-gray-600 hover:text-gray-900 transition-colors">レビュー</a>
              <Link 
                href="/dashboard"
                className="block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors text-center"
              >
                ダッシュボード
              </Link>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <motion.div
                  className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>AI搭載タスク管理</span>
                </motion.div>
                
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                  生産性を
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    革新する
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  世界最高峰のインテリジェントなタスク管理システム。AIの力でタスクを自動化し、
                  ゲーミフィケーションでモチベーションを向上させ、チームの成果を最大化します。
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>今すぐ無料で始める</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                
                <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-white/50 transition-all hover:scale-105 flex items-center justify-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>デモを見る</span>
                </button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>永久無料プラン</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>クレジットカード不要</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="glass rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">今日のタスク</h3>
                    <div className="flex items-center space-x-2 text-sm text-primary">
                      <Trophy className="h-4 w-4" />
                      <span>レベル 12 • 2,450 XP</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { title: '四半期レポートのレビュー', completed: true, xp: 30 },
                      { title: 'チーム朝会', completed: true, xp: 20 },
                      { title: 'プロジェクトロードマップ更新', completed: false, xp: 25 },
                      { title: 'クライアント向けプレゼン準備', completed: false, xp: 35 }
                    ].map((task, index) => (
                      <motion.div
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                          task.completed ? 'bg-green-50' : 'bg-white/50'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <CheckCircle className={`h-5 w-5 ${
                          task.completed ? 'text-green-500' : 'text-gray-300'
                        }`} />
                        <span className={`flex-1 ${
                          task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </span>
                        <span className="text-xs text-primary font-medium">+{task.xp} XP</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">今日の進捗</span>
                      <span className="text-primary font-medium">2/4 完了</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '50%' }}
                        transition={{ delay: 1, duration: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center space-y-4 mb-16"
            {...fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              モダンチーム向けの
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                強力な機能
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              最先端のAIで生産性を向上させ、あなたの働き方に合わせて設計された、必要な機能のすべてを提供します。
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="glass rounded-2xl p-8 border border-white/20 hover:shadow-xl transition-all hover:scale-105"
                variants={fadeInUp}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { number: '50K+', label: 'アクティブユーザー' },
              { number: '2M+', label: '完了タスク' },
              { number: '300+', label: '連携サービス' },
              { number: '99.9%', label: 'アップタイム' }
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center space-y-4 mb-16"
            {...fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                何千人
              </span>
              もの方に愛用されています
            </h2>
            <p className="text-xl text-gray-600">
              FlowCraft Proについてユーザーの皆様の声をお聞きください
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="glass rounded-2xl p-8 border border-white/20"
                variants={fadeInUp}
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center space-y-4 mb-16"
            {...fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              シンプルで
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                透明な料金体系
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              ニーズに合った最適なプランをお選びください。いつでもアップグレード・ダウングレード可能です。
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                className={`relative glass rounded-2xl p-8 border ${
                  plan.popular 
                    ? 'border-primary shadow-xl scale-105' 
                    : 'border-white/20'
                }`}
                variants={fadeInUp}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                      人気No.1
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/dashboard"
                  className={`w-full py-3 rounded-lg font-semibold transition-all block text-center ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'border border-gray-300 text-gray-700 hover:bg-white/50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            className="space-y-8 text-white"
            {...fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold">
              生産性を変革する準備はできていますか？
            </h2>
            <p className="text-xl text-blue-100">
              FlowCraft Proでワークフローを革新した何千ものプロフェッショナルに仲間入りしましょう。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>無料トライアルを始める</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all hover:scale-105">
                デモを予約
              </button>
            </div>
            <p className="text-sm text-blue-100">
              14日間無料トライアル • クレジットカード不要 • いつでもキャンセル可能
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Zap className="h-8 w-8 text-primary fill-current" />
                <div>
                  <h3 className="text-xl font-bold">FlowCraft Pro</h3>
                  <p className="text-sm text-gray-400">次世代生産性プラットフォーム</p>
                </div>
              </div>
              <p className="text-gray-400">
                モダンチーム向けに設計された、世界最高峰のインテリジェントなタスク管理プラットフォーム。
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">製品</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">機能</a></li>
                <li><a href="#" className="hover:text-white transition-colors">連携</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">セキュリティ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">会社</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">会社概要</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ブログ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">採用</a></li>
                <li><a href="#" className="hover:text-white transition-colors">お問い合わせ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">ヘルプセンター</a></li>
                <li><a href="#" className="hover:text-white transition-colors">コミュニティ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ステータス</a></li>
                <li><a href="#" className="hover:text-white transition-colors">プライバシー</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 FlowCraft Pro. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">利用規約</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">プライバシー</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">クッキー</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}