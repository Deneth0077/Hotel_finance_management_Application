"use client";

import { UserCircle, Shield, Briefcase, Mail, Phone, Calendar, MapPin, Edit, Camera } from "lucide-react";

export default function ProfilesPage() {
  const profiles = [
    {
      role: "Property Owner",
      name: "Chathuranga KHD",
      title: "Chief Executive Officer",
      email: "owner@luxeledger.com",
      phone: "+94 76 119 3338",
      since: "March 2024",
      location: "Galle, Sri Lanka",
      color: "from-blue-600 to-indigo-600",
      bio: "Visionary leader with 10+ years in premium hospitality management. Focused on driving excellence and financial transparency through LuxeLedger architecture."
    },
    {
      role: "Operations Manager",
      name: "Saman Kumara",
      title: "General Manager",
      email: "manager@luxeledger.com",
      phone: "+94 77 123 4567",
      since: "May 2024",
      location: "Galle, Sri Lanka",
      color: "from-emerald-600 to-teal-600",
      bio: "Dedicated hospitality professional ensuring seamless daily operations and guest satisfaction. Expert in staff coordination and inventory management."
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Profiles</h1>
        <p className="text-muted-foreground">Manage administrative access and profile information for key members.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {profiles.map((profile, index) => (
          <div key={index} className="bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500">
            {/* Header / Banner */}
            <div className={`h-32 bg-gradient-to-r ${profile.color} relative`}>
              <div className="absolute -bottom-12 left-8 p-1 bg-card rounded-2xl border shadow-lg">
                <div className={`h-24 w-24 rounded-xl bg-gradient-to-br ${profile.color} flex items-center justify-center text-white`}>
                  <UserCircle className="h-16 w-16 opacity-80" />
                </div>
              </div>
              <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="pt-16 p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r ${profile.color} text-white`}>
                      {profile.role}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                  <p className="text-muted-foreground font-medium">{profile.title}</p>
                </div>
                <button className="p-2 border rounded-xl hover:bg-muted transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground italic">
                "{profile.bio}"
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span>Joined {profile.since}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span>{profile.location}</span>
                </div>
              </div>

              <div className="pt-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Access Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold rounded-lg uppercase">Full Architecture Access</span>
                  <span className="px-3 py-1 bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold rounded-lg uppercase">Financial Control</span>
                  {profile.role === "Property Owner" && (
                     <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold rounded-lg uppercase">Ownership Registry</span>
                  )}
                  <span className="px-3 py-1 bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold rounded-lg uppercase">Staff Management</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
