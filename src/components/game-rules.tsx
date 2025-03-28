"use client";

import type React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface GameRulesProps {
  sections: {
    title: string;
    content: React.ReactNode;
  }[];
}

export function GameRules({ sections }: GameRulesProps) {
  return (
    <div className="w-full">
      <div className="bg-[#B5411E] mb-4 p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold text-white">Game Rules</h2>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {sections.map((section, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-lg font-medium">
              {section.title}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {section.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
