import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for exploring",
    features: ["Up to 3 projects", "Basic analytics", "Community support", "1 GB storage"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing teams",
    features: ["Unlimited projects", "Advanced analytics", "Priority support", "50 GB storage", "Custom integrations", "Team collaboration"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: ["Everything in Pro", "Dedicated support", "Custom SLAs", "Unlimited storage", "SSO & SAML", "On-premise option"],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Pricing</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">No hidden fees. Cancel anytime.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? "glass-card shadow-card-hover ring-2 ring-primary/20 scale-105"
                  : "glass-card"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-cta text-primary-foreground text-xs font-semibold">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-display font-bold text-foreground">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              <div className="mt-6 mb-6">
                <span className="text-4xl font-display font-extrabold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant={plan.popular ? "hero" : "hero-outline"} className="w-full">
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
