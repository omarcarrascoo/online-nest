
export default function NestCardSimpleRow ({
    label,
    value
}:{label:string, value?:string | number | null}) {
    return(
        <div key={label} className="flex justify-between py-2">
        <span className="text-gray-500 uppercase text-xs">{label}</span>
        <span className="text-gray-900 font-normal">{value ?? "—"}</span>
      </div>
    )
}