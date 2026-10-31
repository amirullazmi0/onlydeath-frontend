import CatalogDetailView from './catalog.detail.view';

export default async function Page({ params }: PageProps<'/catalog/[slug]'>) {
    const { slug } = await params;
    return <CatalogDetailView slug={slug} />;
}
