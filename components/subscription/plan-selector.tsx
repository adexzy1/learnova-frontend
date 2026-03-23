"use client";

import { Check, X, Sparkles, Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types";

interface PlanSelectorProps {
  plans: SubscriptionPlan[];
  currentPlanId: string | undefined;
  isLoading: boolean;
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

export function PlanSelector({
  plans,
  currentPlanId,
  isLoading,
  onSelectPlan,
}: PlanSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-48 mt-1" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-32" />
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Available Plans
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose the plan that best fits your school&apos;s needs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isPopular = plan.isPopular;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col transition-all duration-200 hover:shadow-lg",
                isPopular &&
                  "border-primary/50 shadow-md ring-1 ring-primary/20",
                isCurrent && "border-primary bg-primary/2",
              )}
            >
              {/* Popular badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 bg-primary text-primary-foreground shadow-sm px-3">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className={cn(isPopular && "pt-6")}>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {plan.name === "Premium" && (
                      <Crown className="h-4 w-4 text-amber-500" />
                    )}
                    {plan.name}
                  </CardTitle>
                  {isCurrent && (
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/30"
                    >
                      Current
                    </Badge>
                  )}
                </div>
                <CardDescription className="min-h-10">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {/* Pricing */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">
                      ₦{plan.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{plan.interval}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Features */}
                <ul className="space-y-2.5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-4">
                <Button
                  onClick={() => onSelectPlan(plan)}
                  variant={
                    isCurrent ? "outline" : isPopular ? "default" : "outline"
                  }
                  className={cn(
                    "w-full",
                    isPopular && !isCurrent && "shadow-sm",
                  )}
                  disabled={isCurrent}
                >
                  {isCurrent
                    ? "Current Plan"
                    : `${
                        currentPlanId &&
                        plans.findIndex((p) => p.id === currentPlanId) >
                          plans.findIndex((p) => p.id === plan.id)
                          ? "Downgrade"
                          : "Upgrade"
                      } to ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
