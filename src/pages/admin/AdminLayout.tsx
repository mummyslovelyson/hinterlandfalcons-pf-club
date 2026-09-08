import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { AdminMobileProvider, useAdminMobile } from '@/context/AdminMobileContext';

const AdminLayoutContent = () => {
  const { isOpen, setIsOpen, close } = useAdminMobile();

  return (
    <div className="fixed inset-0 overflow-hidden flex w-full bg-muted/30 print:bg-white">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <AdminSidebar className="print:hidden h-full" />
      </div>

      {/* Mobile Drawer Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-72 max-w-[85vw] bg-sidebar border-sidebar-border [&>button]:text-sidebar-foreground">
          <SheetTitle className="sr-only">Admin navigation menu</SheetTitle>
          <AdminSidebar
            hideCollapse
            onNavigate={close}
            className="h-full border-r-0 w-full"
          />
        </SheetContent>
      </Sheet>

      {/* Main Admin Content Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 h-full">
        <Outlet />
      </div>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <AdminMobileProvider>
      <AdminLayoutContent />
    </AdminMobileProvider>
  );
};

export default AdminLayout;
