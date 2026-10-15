"use client";

import { SiteHeader } from "@/components/site-header";
import { AdminPanel } from "@/components/admin-panel";
import { OfficersManager } from "@/components/officers-manager";
import { PortAuthoritiesManager } from "@/components/port-authorities-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader active="/admin" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-[color:var(--sea-foam-deep)] uppercase">
            Γραφείο / διοίκηση
          </p>
          <h1 className="mt-1 font-heading text-3xl text-[color:var(--sea-ink)] sm:text-4xl">
            Admin κλήσεων
          </h1>
          <p className="mt-2 text-[color:var(--sea-muted)]">
            Προβολή κλήσεων, εύρεση, οριστικοποίηση, ειδοποιήσεις πληρωμής, και
            καταχώριση λιμενικών / λιμενικών αρχών.
          </p>
        </div>

        <Tabs defaultValue="citations" className="gap-6">
          <TabsList
            variant="line"
            className="h-auto w-full flex-wrap justify-start gap-1 border-b border-[color:var(--sea-line)] pb-0"
          >
            <TabsTrigger
              value="citations"
              className="h-10 px-3 text-sm data-active:text-[color:var(--sea-ink)]"
            >
              Κλήσεις
            </TabsTrigger>
            <TabsTrigger
              value="officers"
              className="h-10 px-3 text-sm data-active:text-[color:var(--sea-ink)]"
            >
              Καταχώριση λιμενικού
            </TabsTrigger>
            <TabsTrigger
              value="ports"
              className="h-10 px-3 text-sm data-active:text-[color:var(--sea-ink)]"
            >
              Λιμενική αρχή
            </TabsTrigger>
          </TabsList>
          <TabsContent value="citations">
            <AdminPanel />
          </TabsContent>
          <TabsContent value="officers">
            <OfficersManager />
          </TabsContent>
          <TabsContent value="ports">
            <PortAuthoritiesManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
