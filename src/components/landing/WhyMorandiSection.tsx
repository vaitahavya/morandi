'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, ShieldCheck, Sparkles } from 'lucide-react';

export default function WhyMorandiSection() {
  const reasons = [
    {
      icon: Zap,
      title: "Integrated Supply Chain",
      description: "From sourcing to delivery, we ensure a seamless process rooted in care — using 100% natural fibres.",
      color: "text-soft-sage"
    },
    {
      icon: ShieldCheck,
      title: "Quality Assurance",
      description: "Every product goes through rigorous checks to meet the highest standards.",
      color: "text-clay-pink"
    },
    {
      icon: Sparkles,
      title: "Expert Backed Design",
      description: "Skilled experts craft each product blending comfort and style.",
      color: "text-soft-sage"
    }
  ];

  return (
    <section className="py-24 bg-muted/50 relative overflow-hidden">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-10 left-10 w-72 h-72 bg-clay-pink/20 rounded-full blur-3xl" />
        <div className="absolute top-32 right-20 w-64 h-64 bg-soft-sage/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-56 h-56 bg-clay-pink/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-soft-sage/15 rounded-full blur-3xl" />
      </div>
      
      <div className="section-container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <Badge variant="secondary" className="mb-2">
            Our Promise
          </Badge>
          <h2 className="heading-lg text-foreground">
            Why Morandi Lifestyle?
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>
        
        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <Card 
                key={index}
                className="text-center group border-0 bg-card/80 backdrop-blur-sm shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  {/* Icon Container */}
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-muted to-accent/20 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm">
                    <Icon className={`w-10 h-10 ${reason.color}`} strokeWidth={1.5} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="heading-sm mb-4 text-foreground">
                    {reason.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {reason.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 glass rounded-2xl px-8 py-5 shadow-soft hover:shadow-card transition-all duration-300">
            <div className="w-3 h-3 rounded-full bg-soft-sage animate-pulse" />
            <span className="text-foreground font-medium text-lg">Experience the difference</span>
            <div className="w-3 h-3 rounded-full bg-clay-pink animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
