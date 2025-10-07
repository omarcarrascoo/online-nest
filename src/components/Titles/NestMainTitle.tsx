import { UserIcon } from "lucide-react";

export default function NestTitleMain ({
    children,
    icon
}:{children: React.ReactNode, icon?:any}) {
    return(
        <div className="flex items-center mb-4">
            {icon}
            {/* <UserIcon className="h-5 w-5 text-[#063a58]" /> */}
            <h2 className="ml-2 text-lg font-semibold text-[#063a58]">
                {children}
            </h2>
        </div>
    )
}