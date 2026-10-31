import AdminOrderDetailView from './admin.order.detail.view';

export default async function Page({ params }: PageProps<'/admin/orders/[id]'>) {
    const { id } = await params;
    return <AdminOrderDetailView id={id} />;
}
