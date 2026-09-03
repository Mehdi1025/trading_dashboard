"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type Hero195Tab = {
  title: string;
  value: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
};

export type Hero195Props = {
  title?: string;
  description?: string;
  eyebrow?: string;
  primaryButtonText?: React.ReactNode;
  secondaryButtonText?: React.ReactNode;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  tabs: Hero195Tab[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  variant?: "full" | "section" | "studio";
};

function PreviewFrame({
  children,
  tabs,
  studio = false,
}: {
  children: React.ReactNode;
  tabs?: React.ReactNode;
  studio?: boolean;
}) {
  return (
    <div className="relative mx-auto w-full">
      <div className="pointer-events-none absolute -inset-x-4 -top-4 bottom-0 hidden lg:block">
        <div className="absolute left-0 top-0 h-8 w-8 border-l border-t border-dashed border-muted-foreground/25" />
        <div className="absolute right-0 top-0 h-8 w-8 border-r border-t border-dashed border-muted-foreground/25" />
        <div className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-dashed border-muted-foreground/25" />
        <div className="absolute bottom-0 right-0 h-8 w-8 border-b border-r border-dashed border-muted-foreground/25" />
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border/80 bg-muted/10 shadow-2xl shadow-black/20",
          studio ? "p-1" : "p-1",
        )}
      >
        <div className="relative overflow-hidden rounded-lg border border-border/50 bg-background/95 backdrop-blur-xl">
          <BorderBeam size={250} duration={12} delay={9} colorFrom="#ffaa40" colorTo="#9c40ff" />
          {tabs && (
            <div className="relative z-10 border-b border-border/40 bg-muted/20 px-3 py-2 md:px-4">
              {tabs}
            </div>
          )}
          <div className={cn("relative z-10", studio ? "p-3 md:p-4" : "p-4 md:p-6")}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero195({
  title = "Tableau de Bord",
  description = "Suivez vos actifs, vos performances live et les actualités du marché.",
  eyebrow = "Portfolio Crypto",
  primaryButtonText = "Nouvel Actif",
  secondaryButtonText = "Vue d'ensemble",
  onPrimaryClick,
  onSecondaryClick,
  tabs,
  value,
  defaultValue,
  onValueChange,
  className,
  variant = "full",
}: Hero195Props) {
  const initialTab = defaultValue ?? tabs[0]?.value ?? "overview";
  const isStudio = variant === "studio";
  const isSection = variant === "section";

  const tabList = (
    <TabsList
      className={cn(
        "flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0",
        !isStudio && "mx-auto mb-8 w-fit max-w-xs justify-center bg-muted/60 md:max-w-none",
      )}
    >
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className={cn(
            "gap-1.5 rounded-lg px-3 py-2 text-sm font-normal text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            isStudio && "data-[state=active]:ring-1 data-[state=active]:ring-border/60",
          )}
        >
          {tab.icon}
          {tab.title}
        </TabsTrigger>
      ))}
    </TabsList>
  );

  if (isStudio) {
    return (
      <section className={cn("overflow-hidden", className)}>
        <Tabs
          value={value}
          defaultValue={value ? undefined : initialTab}
          onValueChange={onValueChange}
          className="animate-fade-in"
        >
          <PreviewFrame studio tabs={tabList}>
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="mt-0 focus-visible:outline-none"
              >
                {tab.content}
              </TabsContent>
            ))}
          </PreviewFrame>
        </Tabs>
      </section>
    );
  }

  return (
    <section className={cn("overflow-hidden", className)}>
      <div className={cn(isSection ? "w-full" : "container mx-auto max-w-7xl")}>
        <div
          className={cn(
            isSection
              ? "rounded-2xl border border-border/80 bg-gradient-to-b from-muted/30 via-background to-background p-6 md:p-10"
              : "border-x border-border px-6 py-12 md:py-20",
          )}
        >
          <div
            className={cn(
              "relative animate-fade-in p-2",
              isSection ? "mx-auto max-w-3xl" : "mx-auto max-w-2xl",
            )}
          >
            {isSection && (
              <div className="mb-6 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-violet-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                  Section Hero195
                </span>
              </div>
            )}
            <p className="text-center text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1
              className={cn(
                "mx-1 mt-4 text-center font-bold tracking-tighter",
                isSection ? "text-4xl md:text-5xl" : "text-5xl md:text-7xl",
              )}
            >
              {title}
            </h1>
            <p className="mx-2 mt-6 max-w-xl text-center text-lg font-medium text-muted-foreground md:mx-auto md:text-xl">
              {description}
            </p>
            {(primaryButtonText || secondaryButtonText) && (
              <div className="mx-2 mt-6 flex flex-wrap justify-center gap-2">
                {primaryButtonText && (
                  <Button size="lg" onClick={onPrimaryClick}>
                    {primaryButtonText}
                  </Button>
                )}
                {secondaryButtonText && (
                  <Button size="lg" variant="outline" onClick={onSecondaryClick}>
                    {secondaryButtonText}
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className={cn("animate-fade-in", isSection ? "mt-10 md:mt-12" : "mt-16 md:mt-20")}>
            <Tabs
              value={value}
              defaultValue={value ? undefined : initialTab}
              onValueChange={onValueChange}
            >
              <div className="px-2">{tabList}</div>

              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  <PreviewFrame>{tab.content}</PreviewFrame>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}
