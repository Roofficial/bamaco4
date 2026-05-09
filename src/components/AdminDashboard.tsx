import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminApproval from './AdminApproval';
import GlobalStats from './GlobalStats';
import { LayoutDashboard, UserCheck, Settings } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 italic">Central command</h2>
          <p className="text-slate-500">Oversee ecosystem health and specialist credentials.</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-slate-100 p-1 rounded-2xl w-fit h-auto flex gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all decoration-transparent">
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="verifications" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all decoration-transparent">
            <UserCheck className="w-4 h-4" />
            Verifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <GlobalStats />
        </TabsContent>

        <TabsContent value="verifications">
           <AdminApproval />
        </TabsContent>
      </Tabs>
    </div>
  );
}
