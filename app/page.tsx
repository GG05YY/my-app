import { ScrollReveal } from "./components/scroll-reveal";
import { SiteHeader } from "./components/site-header";

const features = [
  {
    title: "实时协作",
    description: "多人同时编辑，变更即时同步，告别版本混乱。",
    span: "sm:col-span-1",
    gradient: "from-[#0071e3]/20 to-[#2997ff]/5",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 2.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-2.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    title: "智能工作流",
    description: "AI 自动归类任务、预测排期，让团队始终领先一步。",
    span: "sm:col-span-1",
    gradient: "from-[#bf5af2]/20 to-[#ff375f]/5",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
  {
    title: "企业级安全",
    description: "端到端加密、SSO 单点登录，满足最严格合规要求。",
    span: "sm:col-span-1",
    gradient: "from-[#30d158]/20 to-[#0071e3]/5",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "全平台同步",
    description: "Mac、iPhone、iPad、Web 无缝衔接，随时随地保持高效。",
    span: "sm:col-span-2 lg:col-span-2",
    gradient: "from-[#ff9f0a]/15 via-[#bf5af2]/10 to-[#2997ff]/10",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.53l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
      </svg>
    ),
  },
];

const plans = [
  {
    name: "个人版",
    price: "免费",
    period: "",
    description: "适合个人创作者与小团队起步。",
    features: ["最多 3 个项目", "5 GB 存储", "基础协作工具"],
    cta: "免费开始",
    highlighted: false,
  },
  {
    name: "团队版",
    price: "¥68",
    period: "/人/月",
    description: "成长型团队的最佳选择。",
    features: ["无限项目", "100 GB 存储", "AI 工作流", "优先支持"],
    cta: "免费试用 14 天",
    highlighted: true,
    badge: "最受欢迎",
  },
  {
    name: "企业版",
    price: "定制",
    period: "",
    description: "大型组织的安全与管控需求。",
    features: ["无限存储", "SSO & SAML", "专属客户经理", "SLA 保障"],
    cta: "联系销售",
    highlighted: false,
  },
];

const logos = ["Stripe", "Notion", "Figma", "Linear", "Vercel"];

const footerColumns = [
  { title: "产品", links: ["功能", "定价", "更新日志", "路线图"] },
  { title: "资源", links: ["文档", "API", "社区", "博客"] },
  { title: "公司", links: ["关于", "招聘", "隐私", "条款"] },
  { title: "支持", links: ["帮助中心", "状态页", "联系我们", "反馈"] },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="hero-mesh relative overflow-hidden pt-28 pb-20 text-center md:pt-40 md:pb-28">
          <div className="orb orb-1 pointer-events-none" aria-hidden />
          <div className="orb orb-2 pointer-events-none" aria-hidden />
          <div className="orb orb-3 pointer-events-none" aria-hidden />

          <div className="relative mx-auto max-w-[980px] px-6">
            <p className="animate-hero-badge mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm font-medium text-accent backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              全新 Flow 3.0 现已发布
            </p>

            <h1 className="animate-hero-title mx-auto max-w-[800px] text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[56px] lg:text-[72px]">
              <span className="gradient-text">让团队协作，</span>
              <br />
              <span className="gradient-text">如丝般顺滑。</span>
            </h1>

            <p className="animate-hero-subtitle mx-auto mt-6 max-w-[540px] text-[19px] leading-[1.42] text-muted md:text-[21px]">
              简洁而强大的工作平台，专为注重体验的现代团队打造。
            </p>

            <div className="animate-hero-cta mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#pricing"
                className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-full bg-accent px-8 text-[17px] font-medium text-white shadow-lg shadow-accent/25 transition-all hover:scale-[1.02] hover:bg-[#0077ed] hover:shadow-accent/35 dark:hover:bg-[#40a9ff]"
              >
                免费试用
              </a>
              <a
                href="#features"
                className="inline-flex h-12 min-w-[160px] items-center justify-center gap-1 rounded-full border border-foreground/10 bg-surface/60 px-8 text-[17px] font-medium text-accent backdrop-blur-sm transition-all hover:border-accent/30 hover:bg-surface"
              >
                了解更多
                <span aria-hidden>›</span>
              </a>
            </div>
          </div>

          {/* Product mockup */}
          <div className="animate-hero-mockup relative mx-auto mt-16 max-w-[920px] px-6 md:mt-24">
            <div className="animate-float">
              <div className="gradient-border overflow-hidden rounded-[20px] p-[1px] shadow-2xl shadow-black/15 dark:shadow-black/50">
                <div className="overflow-hidden rounded-[19px] bg-[#1d1d1f] dark:bg-black">
                  <div className="flex items-center gap-2 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent px-4 py-3">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    <span className="ml-4 text-xs text-white/40">Flow — 项目看板</span>
                  </div>
                  <div className="bg-gradient-to-br from-[#1d1d1f] via-[#2d2d30] to-[#1d1d1f] p-5 dark:from-black dark:via-[#161617] dark:to-black">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {["设计中", "开发中", "已上线"].map((col, i) => (
                        <div
                          key={col}
                          className="rounded-xl border border-white/5 bg-white/5 p-3 backdrop-blur-sm"
                        >
                          <p className="mb-3 text-xs font-medium text-white/50">{col}</p>
                          {[1, 2].map((card) => (
                            <div
                              key={card}
                              className="mb-2 rounded-lg border border-white/5 bg-gradient-to-br from-white/10 to-white/5 p-3"
                              style={{ opacity: 1 - (i + card) * 0.07 }}
                            >
                              <div
                                className="mb-2 h-2 rounded bg-gradient-to-r from-white/25 to-white/10"
                                style={{ width: `${70 - card * 10}%` }}
                              />
                              <div className="h-1.5 w-1/2 rounded bg-white/10" />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="border-y border-foreground/5 bg-surface py-14 dark:bg-surface-elevated">
          <div className="mx-auto max-w-[980px] px-6 text-center">
            <p className="text-sm text-muted">全球超过 10,000 支团队信赖 Flow</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
              {logos.map((name) => (
                <span
                  key={name}
                  className="bg-gradient-to-b from-foreground/30 to-foreground/10 bg-clip-text text-lg font-semibold tracking-tight text-transparent"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 md:py-32">
          <div className="mx-auto max-w-[980px] px-6">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] md:text-[48px]">
                  为高效而生。
                </h2>
                <p className="mx-auto mt-4 max-w-[520px] text-[17px] leading-relaxed text-muted md:text-[19px]">
                  每一个功能都经过精心打磨，让你专注于真正重要的事。
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <ScrollReveal
                  key={feature.title}
                  className={feature.span}
                  delay={i * 80}
                >
                  <div className="feature-card group relative h-full rounded-2xl p-8">
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                    />
                    <div className="relative">
                      <div className="mb-5 inline-flex rounded-2xl bg-surface-elevated p-3.5 text-foreground ring-1 ring-foreground/5 transition-all duration-300 group-hover:bg-accent/10 group-hover:text-accent group-hover:ring-accent/20">
                        {feature.icon}
                      </div>
                      <h3 className="text-[21px] font-semibold tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-muted">
                        {feature.description}
                      </p>
                      <a
                        href="#"
                        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-all duration-300 group-hover:opacity-100"
                      >
                        了解更多 <span aria-hidden>›</span>
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* AI Highlight */}
        <section className="relative overflow-hidden bg-[#1d1d1f] py-24 text-white md:py-32 dark:bg-black">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 20% 50%, rgba(41,151,255,0.25), transparent), radial-gradient(ellipse 50% 40% at 80% 30%, rgba(191,90,242,0.2), transparent)",
            }}
          />
          <div className="relative mx-auto max-w-[980px] px-6">
            <div className="grid items-center gap-14 md:grid-cols-2">
              <ScrollReveal>
                <h2 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] md:text-[48px]">
                  AI 助手，
                  <br />
                  懂你所想。
                </h2>
                <p className="mt-5 text-[17px] leading-relaxed text-white/60 md:text-[19px]">
                  Flow Intelligence 深度理解你的工作习惯，自动总结会议、生成待办、优化排期——一切悄然完成。
                </p>
                <a
                  href="#"
                  className="mt-6 inline-flex items-center gap-1 text-[17px] font-medium text-[#2997ff] transition-colors hover:underline"
                >
                  探索 AI 功能 <span aria-hidden>›</span>
                </a>
              </ScrollReveal>

              <ScrollReveal delay={120}>
                <div className="gradient-border rounded-2xl p-8">
                  <div className="relative space-y-4 rounded-2xl bg-gradient-to-br from-[#2997ff]/15 via-[#bf5af2]/10 to-[#30d158]/10 p-6 backdrop-blur-xl">
                    <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                      <p className="text-xs font-medium text-white/50">Flow AI</p>
                      <p className="mt-2 text-[15px] leading-relaxed">
                        根据上周会议记录，我已为你生成 12 项待办，并建议将「产品发布」优先级提升至 P0。
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "自动排期", color: "from-[#2997ff]/40 to-[#2997ff]/10" },
                        { label: "智能摘要", color: "from-[#bf5af2]/40 to-[#bf5af2]/10" },
                        { label: "风险预警", color: "from-[#30d158]/40 to-[#30d158]/10" },
                      ].map((tag) => (
                        <span
                          key={tag.label}
                          className={`rounded-full bg-gradient-to-r ${tag.color} px-3 py-1 text-xs font-medium backdrop-blur-sm`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 md:py-32">
          <div className="mx-auto max-w-[980px] px-6 text-center">
            <ScrollReveal>
              <h2 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] md:text-[48px]">
                用户怎么说。
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <blockquote className="mx-auto mt-14 max-w-[680px]">
                <p className="text-[24px] font-medium leading-snug tracking-[-0.01em] md:text-[32px]">
                  &ldquo;切换到 Flow 之后，我们团队的交付速度提升了 40%。它就像 Apple 产品一样——你感觉不到它的存在，但它让一切变得更好。&rdquo;
                </p>
                <footer className="mt-8 flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#bf5af2] text-sm font-semibold text-white">
                    张
                  </div>
                  <div>
                    <p className="text-[15px] font-medium">张明</p>
                    <p className="text-sm text-muted">产品总监 · 某科技公司</p>
                  </div>
                </footer>
              </blockquote>
            </ScrollReveal>
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className="relative overflow-hidden bg-surface py-24 md:py-32 dark:bg-surface-elevated"
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-[980px] px-6">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] md:text-[48px]">
                  简单透明的定价。
                </h2>
                <p className="mx-auto mt-4 max-w-[480px] text-[17px] text-muted md:text-[19px]">
                  无隐藏费用。随时升级或取消。
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {plans.map((plan, i) => (
                <ScrollReveal key={plan.name} delay={i * 100}>
                  <div
                    className={`relative flex h-full flex-col rounded-2xl p-8 transition-transform duration-300 hover:scale-[1.02] ${
                      plan.highlighted
                        ? "pricing-highlight text-white"
                        : "border border-foreground/5 bg-surface-elevated dark:bg-surface"
                    }`}
                  >
                    {"badge" in plan && plan.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-[#bf5af2] px-3 py-0.5 text-xs font-medium text-white shadow-lg">
                        {plan.badge}
                      </span>
                    )}
                    <h3 className="text-[17px] font-semibold">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-[44px] font-semibold tracking-tight">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span
                          className={`text-sm ${plan.highlighted ? "text-white/60" : "text-muted"}`}
                        >
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-2 text-[15px] ${plan.highlighted ? "text-white/60" : "text-muted"}`}
                    >
                      {plan.description}
                    </p>
                    <ul className="mt-6 flex-1 space-y-3">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className={`flex items-center gap-2.5 text-[15px] ${plan.highlighted ? "text-white/85" : ""}`}
                        >
                          <svg
                            className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-[#30d158]" : "text-accent"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9.75-3.75 15 6.75" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a
                      href="#"
                      className={`mt-8 flex h-11 items-center justify-center rounded-full text-[15px] font-medium transition-all ${
                        plan.highlighted
                          ? "bg-white text-[#1d1d1f] hover:bg-white/90"
                          : "bg-foreground text-background hover:opacity-90"
                      }`}
                    >
                      {plan.cta}
                    </a>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden py-24 text-center md:py-32">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 100%, color-mix(in srgb, var(--accent) 12%, transparent), transparent)",
            }}
          />
          <ScrollReveal>
            <div className="relative mx-auto max-w-[640px] px-6">
              <h2 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] md:text-[56px]">
                准备好开始了吗？
              </h2>
              <p className="mt-5 text-[17px] text-muted md:text-[21px]">
                加入全球 10,000+ 团队，体验下一代协作方式。
              </p>
              <a
                href="#pricing"
                className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-accent px-10 text-[17px] font-medium text-white shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] hover:bg-[#0077ed] dark:hover:bg-[#40a9ff]"
              >
                免费试用 14 天
              </a>
              <p className="mt-4 text-sm text-muted">无需信用卡 · 随时取消</p>
            </div>
          </ScrollReveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-foreground/5 bg-surface-elevated">
        <div className="mx-auto max-w-[980px] px-6 py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-1">
              <p className="text-[21px] font-semibold">Flow</p>
              <p className="mt-3 max-w-[200px] text-xs leading-relaxed text-muted">
                让团队协作，如丝般顺滑。为现代团队打造的协作平台。
              </p>
              <div className="mt-5 flex gap-3">
                {["𝕏", "in", "◎"].map((icon) => (
                  <a
                    key={icon}
                    href="#"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 text-xs text-muted transition-colors hover:bg-foreground/10 hover:text-foreground"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold text-foreground">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs text-muted transition-colors hover:text-foreground"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-foreground/5 pt-8 sm:flex-row">
            <p className="text-xs text-muted">
              Copyright © 2026 Flow Inc. 保留所有权利。
            </p>
            <div className="flex gap-6 text-xs text-muted">
              <a href="#" className="transition-colors hover:text-foreground">
                隐私政策
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                使用条款
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                Cookie 设置
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
