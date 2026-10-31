import FormUpsertAdminProduct from '../../components/form-upsert.admin.products';

export default async function Page({ params }: PageProps<'/admin/products/[id]/edit'>) {
    const { id } = await params;
    return <FormUpsertAdminProduct id={id} />;
}
