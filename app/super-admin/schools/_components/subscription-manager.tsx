"use client";

import { CreditCard, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { Tenant } from "@/types";

interface SubscriptionManagerProps {
  tenant: Tenant;
}

export function SubscriptionManager({ tenant }: SubscriptionManagerProps) {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Essential features for small schools",
      features: ["Up to 50 students", "Basic reporting", "Community support"],
      current: tenant.planId.toLowerCase() === "free",
    },
    {
      name: "Pro",
      price: "$49",
      description: "Advanced features for growing schools",
      features: [
        "Up to 500 students",
        "Advanced reporting",
        "Email support",
        "Finance module",
      ],
      current: tenant.planId.toLowerCase() === "pro",
    },
    {
      name: "Enterprise",
      price: "$199",
      description: "Complete solution for large institutions",
      features: [
        "Unlimited students",
        "Custom branding",
        "Priority support",
        "API access",
        "Dedicate account manager",
      ],
      current: tenant.planId.toLowerCase() === "enterprise",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Subscription Management</h3>
        <p className="text-sm text-muted-foreground">
          View and manage the school's subscription plan.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.current
                ? "border-primary shadow-md relative overflow-hidden"
                : ""
            }
          >
            {plan.current && (
              <div className="absolute top-0 right-0 p-2">
                <Badge>Current Plan</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-3xl font-bold">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </div>
              <Separator />
              <ul className="grid gap-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.current ? "outline" : "default"}
                disabled={plan.current}
              >
                {plan.current ? "Current Plan" : "Upgrade"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage payment details for billing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-md border p-4">
            <CreditCard className="h-6 w-6" />
            <div className="flex-1">
              <p className="font-medium">Visa ending in 4242</p>
              <p className="text-sm text-muted-foreground">Expires 12/24</p>
            </div>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
