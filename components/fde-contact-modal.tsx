"use client";

import * as React from "react";
import { Mail, Phone, MapPin, Calendar, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface FDEContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fdeData: {
    name: string;
    email: string;
    role?: string;
    avatar_url?: string | null;
    bio?: string;
    location?: string;
    phone?: string | null;
    skills?: string[];
    calendly_url?: string | null;
    isActive?: boolean;
  };
  onOpenChat?: () => void;
  onOpenCalendly?: () => void;
}

export function FDEContactModal({
  open,
  onOpenChange,
  fdeData,
  onOpenChat,
  onOpenCalendly,
}: FDEContactModalProps) {
  const initials = fdeData.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "FD";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden border-gray-200 rounded-xl">
        {/* Header with avatar */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="h-16 w-16 border-2 border-gray-100 flex-shrink-0">
              {fdeData.avatar_url ? (
                <AvatarImage src={fdeData.avatar_url} alt={fdeData.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-gray-100 text-gray-600 text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {/* Info */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h2 className="text-lg font-semibold text-gray-900 truncate mb-0.5">
                {fdeData.name}
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                {fdeData.role || "Forward Deploy Engineer"}
              </p>
              <div className="flex items-center gap-1.5">
                <span 
                  className={`h-2 w-2 rounded-full ${
                    fdeData.isActive !== false ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                />
                <span className={`text-xs ${
                  fdeData.isActive !== false ? "text-emerald-600" : "text-gray-500"
                }`}>
                  {fdeData.isActive !== false ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Bio */}
          {fdeData.bio && (
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              {fdeData.bio}
            </p>
          )}

          {/* Contact details */}
          <div className="space-y-3 mb-5">
            <a
              href={`mailto:${fdeData.email}`}
              className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
            >
              <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                <Mail className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Email</div>
                <div className="text-gray-900 truncate">{fdeData.email}</div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            {fdeData.phone && (
              <a
                href={`tel:${fdeData.phone}`}
                className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
              >
                <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                  <Phone className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Teléfono</div>
                  <div className="text-gray-900">{fdeData.phone}</div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}

            {fdeData.location && (
              <div className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-lg text-sm text-gray-700">
                <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Ubicación</div>
                  <div className="text-gray-900">{fdeData.location}</div>
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          {fdeData.skills && fdeData.skills.length > 0 && (
            <div className="mb-5">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-2">Especialidades</div>
              <div className="flex flex-wrap gap-1.5">
                {fdeData.skills.map((skill, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200 font-normal"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-0">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                onOpenChat?.();
                onOpenChange(false);
              }}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-sm h-10"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Abrir chat
            </Button>
            {fdeData.calendly_url && (
              <Button
                onClick={() => {
                  onOpenCalendly?.();
                  onOpenChange(false);
                }}
                variant="outline"
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 text-sm h-10"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Agendar reunión
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

