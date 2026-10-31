import AdminProductDetailView from './admin.product.detail.view';

export default async function Page({ params }: PageProps<'/admin/products/[id]'>) {
    const { id } = await params;
    return <AdminProductDetailView id={id} />;
}
