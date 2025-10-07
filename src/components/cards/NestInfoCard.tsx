export default function NestInfoCard ({
    children
}:{children: React.ReactNode}) {
    return(
        <section className="bg-white border border-gray-200 rounded-xl p-6">
              {children}
        </section>
    )
}