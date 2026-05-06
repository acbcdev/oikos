"use client";

import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { useInvestmentStore } from "@/lib/store/investment-store";
import { PortfoliosPane } from "./portfolios-pane";
import { PositionsPane } from "./positions-pane";
import { CreatePortfolioModal } from "./create-portfolio-modal";

export function PortfolioLayout() {
  useEffect(() => {
    useInvestmentStore.persist.rehydrate();
  }, []);

  const hasPortfolios = useInvestmentStore((s) => s.portfolios.length > 0);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(
    null,
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useHotkeys("c", () => setCreateModalOpen(true), { preventDefault: true });

  return (
    <main className="flex flex-col min-h-screen gap-8 px-8 py-8">
      {hasPortfolios ? (
        <>
          <PortfoliosPane
            selectedPortfolioId={selectedPortfolioId}
            onSelectPortfolio={setSelectedPortfolioId}
            onCreatePortfolio={() => setCreateModalOpen(true)}
          />
          <PositionsPane selectedPortfolioId={selectedPortfolioId} />
        </>
      ) : (
        <Empty className="flex-1 min-h-[calc(100vh-10rem)]">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="size-16 rounded-2xl [&_svg:not([class*='size-'])]:size-8"
            >
              <TrendingUp />
            </EmptyMedia>
            <EmptyTitle className="text-2xl font-bold font-display">
              No portfolios yet
            </EmptyTitle>
            <EmptyDescription className="text-base">
              Create your first portfolio to start tracking your investments.
            </EmptyDescription>
          </EmptyHeader>
          <Button size="xl" onClick={() => setCreateModalOpen(true)}>
            <Plus size={14} />
            Create Portfolio
            <Kbd>C</Kbd>
          </Button>
        </Empty>
      )}

      <CreatePortfolioModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </main>
  );
}
