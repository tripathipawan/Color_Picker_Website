import { motion } from "framer-motion";
import { BarChart3, Zap, Shield, Globe, Layers, Sparkles } from "lucide-react";

const features = [
  { icon: Zap, title: "Lightning Fast", description: "Sub-second response times with edge computing and intelligent caching." },
  { icon: BarChart3, title: "Smart Analytics", description: "Real-time dashboards with AI-powered insights and trend detection." },
  { icon: Shield, title: "Enterprise Security", description: "SOC 2 compliant with end-to-end encryption and SSO support." },
  { icon: Globe, title: "Global Scale", description: "Deploy across 50+ regions with automatic failover and load balancing." },
  { icon: Layers, title: "Seamless Integrations", description: "Connect with 200+ tools including Slack, Jira, and GitHub." },
  { icon: Sparkles, title: "AI Automation", description: "Let AI handle repetitive tasks while your team focuses on what matters." },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Features</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">
            Everything you need to scale
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed for modern teams that move fast and ship faster.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group glass-card rounded-2xl p-8 hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors duration-300">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
