import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { LandingPage } from "./components/LandingPage";
import { DashboardView } from "./components/DashboardView";
import { ProductionQueueView } from "./components/ProductionQueueView";
import { InventoryView } from "./components/InventoryView";
import { CalculatorView } from "./components/CalculatorView";
import { MarketAnalysisView } from "./components/MarketAnalysisView";
import { CreativeStudioView } from "./components/CreativeStudioView";
import { SalesView } from "./components/SalesView";
import { ClientsView } from "./components/ClientsView";
import { FinancialView } from "./components/FinancialView";
import { MachinesView } from "./components/MachinesView";
import { ShopeeIntegrationView } from "./components/ShopeeIntegrationView";
import { MercadoLivreIntegrationView } from "./components/MercadoLivreIntegrationView";
import { SettingsView } from "./components/SettingsView";
import { Generator3DView } from "./components/Generator3DView";
import { AIChatbot } from "./components/AIChatbot";

import {
  initialCustomers,
  initialFilaments,
  initialOrders,
  initialPrinters,
  initialProductionCards,
  initialSavedCalculations,
} from "./mockData";
import {
  AppView,
  Customer,
  Filament,
  OrderItem,
  Printer,
  ProductionCard,
  SavedCalculation,
} from "./types";

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core Application State with LocalStorage persistence
  const [orders, setOrders] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem("versatil_maker_orders");
      return saved ? JSON.parse(saved) : initialOrders;
    } catch {
      return initialOrders;
    }
  });

  const [filaments, setFilaments] = useState<Filament[]>(() => {
    try {
      const saved = localStorage.getItem("versatil_maker_filaments");
      return saved ? JSON.parse(saved) : initialFilaments;
    } catch {
      return initialFilaments;
    }
  });

  const [printers, setPrinters] = useState<Printer[]>(() => {
    try {
      const saved = localStorage.getItem("versatil_maker_printers");
      return saved ? JSON.parse(saved) : initialPrinters;
    } catch {
      return initialPrinters;
    }
  });

  const [productionCards, setProductionCards] = useState<ProductionCard[]>(() => {
    try {
      const saved = localStorage.getItem("versatil_maker_productionCards");
      return saved ? JSON.parse(saved) : initialProductionCards;
    } catch {
      return initialProductionCards;
    }
  });

  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>(() => {
    try {
      const saved = localStorage.getItem("versatil_maker_savedCalculations");
      return saved ? JSON.parse(saved) : initialSavedCalculations;
    } catch {
      return initialSavedCalculations;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem("versatil_maker_customers");
      return saved ? JSON.parse(saved) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  const [creativeStudioProduct, setCreativeStudioProduct] = useState("Escultura Gato Abstrato Geometrico 3D");

  // Sync with LocalStorage on change
  useEffect(() => {
    try { localStorage.setItem("versatil_maker_orders", JSON.stringify(orders)); } catch {}
  }, [orders]);

  useEffect(() => {
    try { localStorage.setItem("versatil_maker_filaments", JSON.stringify(filaments)); } catch {}
  }, [filaments]);

  useEffect(() => {
    try { localStorage.setItem("versatil_maker_printers", JSON.stringify(printers)); } catch {}
  }, [printers]);

  useEffect(() => {
    try { localStorage.setItem("versatil_maker_productionCards", JSON.stringify(productionCards)); } catch {}
  }, [productionCards]);

  useEffect(() => {
    try { localStorage.setItem("versatil_maker_savedCalculations", JSON.stringify(savedCalculations)); } catch {}
  }, [savedCalculations]);

  useEffect(() => {
    try { localStorage.setItem("versatil_maker_customers", JSON.stringify(customers)); } catch {}
  }, [customers]);

  // Reset database handler
  const handleResetDatabase = (mode: 'empty' | 'default') => {
    if (mode === 'empty') {
      setOrders([]);
      setFilaments([]);
      setPrinters([]);
      setProductionCards([]);
      setSavedCalculations([]);
      setCustomers([]);
      localStorage.removeItem("versatil_maker_orders");
      localStorage.removeItem("versatil_maker_filaments");
      localStorage.removeItem("versatil_maker_printers");
      localStorage.removeItem("versatil_maker_productionCards");
      localStorage.removeItem("versatil_maker_savedCalculations");
      localStorage.removeItem("versatil_maker_customers");
    } else {
      setOrders(initialOrders);
      setFilaments(initialFilaments);
      setPrinters(initialPrinters);
      setProductionCards(initialProductionCards);
      setSavedCalculations(initialSavedCalculations);
      setCustomers(initialCustomers);
      localStorage.setItem("versatil_maker_orders", JSON.stringify(initialOrders));
      localStorage.setItem("versatil_maker_filaments", JSON.stringify(initialFilaments));
      localStorage.setItem("versatil_maker_printers", JSON.stringify(initialPrinters));
      localStorage.setItem("versatil_maker_productionCards", JSON.stringify(initialProductionCards));
      localStorage.setItem("versatil_maker_savedCalculations", JSON.stringify(initialSavedCalculations));
      localStorage.setItem("versatil_maker_customers", JSON.stringify(initialCustomers));
    }
  };

  const handleImportDatabase = (data: any): boolean => {
    try {
      if (data && data.database) {
        if (data.database.orders) setOrders(data.database.orders);
        if (data.database.filaments) setFilaments(data.database.filaments);
        if (data.database.printers) setPrinters(data.database.printers);
        if (data.database.productionCards) setProductionCards(data.database.productionCards);
        if (data.database.savedCalculations) setSavedCalculations(data.database.savedCalculations);
        if (data.database.customers) setCustomers(data.database.customers);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // Navigation Helper
  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- FILAMENT ACTIONS ---
  const handleAddFilament = (newFilament: Omit<Filament, "id">) => {
    const created: Filament = {
      ...newFilament,
      id: "f-" + Date.now(),
    };
    setFilaments((prev) => [created, ...prev]);
  };

  const handleUpdateFilamentGrams = (filamentId: string, gramsDeducted: number) => {
    setFilaments((prev) =>
      prev.map((f) => {
        if (f.id !== filamentId) return f;
        const updatedGrams = Math.max(0, f.weightRemainingGrams - gramsDeducted);
        return { ...f, weightRemainingGrams: updatedGrams };
      })
    );
  };

  const handleDeleteFilament = (filamentId: string) => {
    setFilaments((prev) => prev.filter((f) => f.id !== filamentId));
  };

  // --- PRINTER ACTIONS ---
  const handleAddPrinter = (newPrinter: Omit<Printer, "id">) => {
    const created: Printer = {
      ...newPrinter,
      id: "p-" + Date.now(),
    };
    setPrinters((prev) => [...prev, created]);
  };

  const handleUpdatePrinterStatus = (id: string, status: Printer["status"]) => {
    setPrinters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  const handleDeletePrinter = (id: string) => {
    setPrinters((prev) => prev.filter((p) => p.id !== id));
  };

  // --- PRODUCTION QUEUE ACTIONS ---
  const handleAddProductionCard = (newCard: Omit<ProductionCard, "id" | "createdAt">) => {
    const created: ProductionCard = {
      ...newCard,
      id: "card-" + Date.now(),
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };
    setProductionCards((prev) => [created, ...prev]);

    // If assigned to a printer and started, update that printer
    if (created.printerId && created.status === "imprimindo") {
      setPrinters((prev) =>
        prev.map((p) =>
          p.id === created.printerId
            ? { ...p, status: "imprimindo", currentJob: created.title, progressPercent: 10 }
            : p
        )
      );
    }
  };

  const handleUpdateCardStatus = (cardId: string, newStatus: ProductionCard["status"]) => {
    setProductionCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;

        // When card is finalized, deduct filament grams from stock automatically!
        if (newStatus === "finalizado" && c.status !== "finalizado") {
          const targetFilamentId = c.filamentId || filaments[0]?.id;
          if (targetFilamentId) {
            handleUpdateFilamentGrams(targetFilamentId, c.weightGrams);
          }

          // If assigned to a printer, release the printer
          if (c.printerId) {
            setPrinters((printersList) =>
              printersList.map((p) =>
                p.id === c.printerId
                  ? { ...p, status: "livre", currentJob: undefined, progressPercent: 0 }
                  : p
              )
            );
          }
        }

        // If moved to printing, set assigned printer as busy
        if (newStatus === "imprimindo" && c.printerId) {
          setPrinters((printersList) =>
            printersList.map((p) =>
              p.id === c.printerId
                ? { ...p, status: "imprimindo", currentJob: c.title, progressPercent: 35 }
                : p
            )
          );
        }

        return { ...c, status: newStatus };
      })
    );
  };

  const handleDeleteCard = (cardId: string) => {
    setProductionCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  // --- SALES & CUSTOMERS ---
  const handleAddOrder = (newOrder: Omit<OrderItem, "id" | "date">) => {
    const created: OrderItem = {
      ...newOrder,
      id: "ord-" + Date.now(),
      date: new Date().toLocaleDateString("pt-BR"),
    };
    setOrders((prev) => [created, ...prev]);

    // Also automatically create or update customer in CRM
    setCustomers((prev) => {
      const existing = prev.find(
        (cust) => cust.name.toLowerCase() === newOrder.clientName.toLowerCase()
      );
      if (existing) {
        return prev.map((cust) =>
          cust.id === existing.id
            ? {
                ...cust,
                totalOrders: cust.totalOrders + 1,
                totalSpent: cust.totalSpent + newOrder.totalPrice,
                lastOrderDate: new Date().toLocaleDateString("pt-BR"),
              }
            : cust
        );
      }
      return [
        {
          id: "cust-" + Date.now(),
          name: newOrder.clientName,
          phone: "(11) 99887-6655",
          city: "São Paulo, SP",
          totalOrders: 1,
          totalSpent: newOrder.totalPrice,
          lastOrderDate: new Date().toLocaleDateString("pt-BR"),
        },
        ...prev,
      ];
    });

    // Also prompt to add to production queue
    handleAddProductionCard({
      title: `${newOrder.productName} (${newOrder.clientName})`,
      productName: newOrder.productName,
      clientName: newOrder.clientName,
      orderNumber: newOrder.code,
      origin: newOrder.platform,
      weightGrams: 55,
      printTimeHours: 3.5,
      status: "a_fazer",
      priority: "normal",
      printerId: printers[0]?.id,
      filamentId: filaments[0]?.id,
    });
  };

  const handleAddCustomer = (newCust: Omit<Customer, "id">) => {
    const created: Customer = {
      ...newCust,
      id: "cust-" + Date.now(),
    };
    setCustomers((prev) => [created, ...prev]);
  };

  // --- CALCULATOR ACTIONS ---
  const handleSaveCalculation = (newCalc: SavedCalculation) => {
    setSavedCalculations((prev) => [newCalc, ...prev]);
  };

  const handleSendFromCalculatorToQueue = (name: string, weight: number, time: number) => {
    handleAddProductionCard({
      title: name,
      productName: name,
      origin: "Direto",
      weightGrams: weight,
      printTimeHours: time,
      status: "a_fazer",
      priority: "normal",
      printerId: printers[0]?.id,
      filamentId: filaments[0]?.id,
    });
    navigateTo("fila-producao");
  };

  const handleSendFromCalculatorToCreativeStudio = (name: string) => {
    setCreativeStudioProduct(name);
    navigateTo("estudio-criativo");
  };

  // Unread badge count (pending cards in queue)
  const pendingCount = productionCards.filter((c) => c.status === "a_fazer").length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* If currentView === 'landing', show full presentation landing page */}
      {currentView === "landing" ? (
        <LandingPage onEnterApp={(target) => navigateTo(target || "dashboard")} />
      ) : (
        <div className="flex min-h-screen flex-col">
          {/* Header Navigation */}
          <Header
            currentView={currentView}
            onOpenSidebar={() => setSidebarOpen(true)}
            onNavigate={navigateTo}
            unreadCount={pendingCount}
          />

          {/* Sliding Drawer Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentView={currentView}
            onNavigate={navigateTo}
          />

          {/* Main View Router */}
          <main className="flex-1 pb-16">
            {currentView === "dashboard" && (
              <DashboardView
                orders={orders}
                filaments={filaments}
                printers={printers}
                productionCards={productionCards}
                onNavigate={navigateTo}
              />
            )}

            {currentView === "vendas" && (
              <SalesView orders={orders} onAddOrder={handleAddOrder} />
            )}

            {currentView === "clientes" && (
              <ClientsView customers={customers} onAddCustomer={handleAddCustomer} />
            )}

            {currentView === "fila-producao" && (
              <ProductionQueueView
                cards={productionCards}
                printers={printers}
                filaments={filaments}
                onAddCard={handleAddProductionCard}
                onUpdateCardStatus={handleUpdateCardStatus}
                onDeleteCard={handleDeleteCard}
                onNavigateToMachines={() => navigateTo("maquinas")}
              />
            )}

            {currentView === "estoque" && (
              <InventoryView
                filaments={filaments}
                onAddFilament={handleAddFilament}
                onUpdateFilamentGrams={handleUpdateFilamentGrams}
                onDeleteFilament={handleDeleteFilament}
              />
            )}

            {currentView === "maquinas" && (
              <MachinesView
                printers={printers}
                onAddPrinter={handleAddPrinter}
                onUpdatePrinterStatus={handleUpdatePrinterStatus}
                onDeletePrinter={handleDeletePrinter}
              />
            )}

            {(currentView === "calculadora" || currentView === "calculadora-3d") && (
              <CalculatorView
                savedCalculations={savedCalculations}
                onSaveCalculation={handleSaveCalculation}
                onSendToProductionQueue={handleSendFromCalculatorToQueue}
                onSendToCreativeStudio={handleSendFromCalculatorToCreativeStudio}
              />
            )}

            {currentView === "analise-mercado" && <MarketAnalysisView />}

            {currentView === "estudio-criativo" && (
              <CreativeStudioView initialProductName={creativeStudioProduct} />
            )}

            {currentView === "gerador-3d" && (
              <Generator3DView
                onSendToQueue={(title, weight, time) => {
                  handleAddProductionCard({
                    title,
                    productName: title,
                    origin: "Direto",
                    weightGrams: weight,
                    printTimeHours: time,
                    status: "a_fazer",
                    priority: "normal",
                    printerId: printers[0]?.id,
                    filamentId: filaments[0]?.id,
                  });
                  navigateTo("fila-producao");
                }}
              />
            )}

            {currentView === "financeiro" && <FinancialView orders={orders} />}

            {currentView === "integracao-shopee" && <ShopeeIntegrationView />}

            {currentView === "integracao-ml" && <MercadoLivreIntegrationView />}

            {currentView === "configuracoes" && (
              <SettingsView
                orders={orders}
                filaments={filaments}
                printers={printers}
                productionCards={productionCards}
                savedCalculations={savedCalculations}
                customers={customers}
                onResetDatabase={handleResetDatabase}
                onImportDatabase={handleImportDatabase}
              />
            )}
          </main>
        </div>
      )}
      <AIChatbot />
    </div>
  );
}
