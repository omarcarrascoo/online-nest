import { UserIcon } from "lucide-react";

export default function NestBannerPrincipal ({
    children
}:{children: React.ReactNode}) {
    return(
        <header>
        <div className="flex items-center justify-between bg-gradient-to-r from-[#063a58] via-teal-700 to-[#1b3d50] rounded-md px-4 py-6">
            {children}
        </div>
      </header>
    )
}