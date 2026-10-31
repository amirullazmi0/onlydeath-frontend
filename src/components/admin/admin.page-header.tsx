export default function AdminPageHeader({
    title,
    description,
    action,
}: Readonly<{ title: string; description?: string; action?: React.ReactNode }>) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight">{title}</h1>
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
            {action}
        </div>
    );
}
