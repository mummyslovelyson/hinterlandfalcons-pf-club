import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="h-screen overflow-hidden flex w-full bg-muted/30 print:bg-white">
      <AdminSidebar className="print:hidden" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
