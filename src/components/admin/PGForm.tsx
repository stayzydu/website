"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const AMENITY_LIST = ["Bed", "AC", "Study Table", "Chair", "Fan", "Wardrobe", "Balcony Access",
  "CCTV Surveillance", "Refrigerator", "Doctor Consultation", "Laundry Service",
  "Daily Housekeeping", "Power Backup", "Wi-Fi Availability", "Security Guard",
  "Common Dining Area", "Elevator", "Parking", "Bathroom"];

const MEAL_LIST = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const ROOM_TYPES = ["Single", "Double", "Triple"] as const;

type RoomData = {
  type: "Single" | "Double" | "Triple";
  pricePerBed: number;
  amenities: string[];
  existingImages: { url: string; publicId: string }[];
  keepImageIds: string[]; // publicIds of existing room images to keep on save
  newImages: File[];
};

type PGData = {
  name: string; location: string; pgFor: string;
  mealTypes: string[];
  commonAmenities: string[]; thingsToKnow: { allowed: string[]; notAllowed: string[] };
  mapLat: string; mapLng: string; isPublished: boolean;
};

export type ExistingPG = {
  _id: string; name: string; location: string; pgFor: string;
  mealTypes: string[];
  commonAmenities: string[]; thingsToKnow: { allowed: string[]; notAllowed: string[] };
  mapLat?: number; mapLng?: number; isPublished: boolean;
  images: { url: string; publicId: string }[];
  rooms: { type: string; pricePerBed: number; amenities: string[]; images: { url: string; publicId: string }[] }[];
};

export default function PGForm({ existing }: { existing?: ExistingPG }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const isEdit = !!existing;

  const [pg, setPg] = useState<PGData>({
    name: existing?.name ?? "",
    location: existing?.location ?? "",
    pgFor: existing?.pgFor ?? "Both",
    mealTypes: existing?.mealTypes ?? [],
    commonAmenities: existing?.commonAmenities ?? [],
    thingsToKnow: existing?.thingsToKnow ?? { allowed: [], notAllowed: [] },
    mapLat: String(existing?.mapLat ?? ""),
    mapLng: String(existing?.mapLng ?? ""),
    isPublished: existing?.isPublished ?? true,
  });

  const [coverImages, setCoverImages] = useState<File[]>([]);
  const [keepImages, setKeepImages] = useState<string[]>(existing?.images.map(i => i.publicId) ?? []);
  const [rooms, setRooms] = useState<RoomData[]>(
    existing?.rooms.length
      ? existing.rooms.map(r => ({
          type: r.type as "Single" | "Double" | "Triple",
          pricePerBed: r.pricePerBed,
          amenities: r.amenities,
          existingImages: r.images,
          keepImageIds: r.images.map(i => i.publicId),
          newImages: [],
        }))
      : [{ type: "Single", pricePerBed: 0, amenities: [], existingImages: [], keepImageIds: [], newImages: [] }]
  );
  const [allowedInput, setAllowedInput] = useState("");
  const [notAllowedInput, setNotAllowedInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function field(k: keyof PGData, value: string | boolean | string[]) {
    setPg(p => ({ ...p, [k]: value }));
  }

  // Append every picked file, no restrictions — duplicates by name/size are
  // allowed, and there's no count/size cap. The admin decides what to upload.
  function addCoverImages(fileList: FileList | null) {
    setError("");
    const picked = fileList ? Array.from(fileList) : [];
    if (picked.length === 0) return;
    setCoverImages(prev => [...prev, ...picked]);
  }

  function removeCoverImage(i: number) {
    setCoverImages(prev => prev.filter((_, idx) => idx !== i));
  }

  // Object URLs for previewing the newly-picked files. Generated in an effect so
  // the URLs are only revoked on the NEXT change/unmount — never the ones currently
  // being rendered (which was blanking the previews).
  const [coverPreviews, setCoverPreviews] = useState<string[]>([]);
  useEffect(() => {
    const urls = coverImages.map(f => URL.createObjectURL(f));
    setCoverPreviews(urls);
    return () => { urls.forEach(u => URL.revokeObjectURL(u)); };
  }, [coverImages]);

  // Previews for newly-picked room images: one array of object URLs per room.
  const [roomPreviews, setRoomPreviews] = useState<string[][]>([]);
  useEffect(() => {
    const urls = rooms.map(r => r.newImages.map(f => URL.createObjectURL(f)));
    setRoomPreviews(urls);
    return () => { urls.flat().forEach(u => URL.revokeObjectURL(u)); };
    // Re-run whenever the set of picked room files changes.
  }, [rooms]);

  function toggleAmenity(a: string) {
    setPg(p => ({ ...p, commonAmenities: p.commonAmenities.includes(a) ? p.commonAmenities.filter(x => x !== a) : [...p.commonAmenities, a] }));
  }

  function toggleMeal(m: string) {
    setPg(p => ({ ...p, mealTypes: p.mealTypes.includes(m) ? p.mealTypes.filter(x => x !== m) : [...p.mealTypes, m] }));
  }

  function addAllowed() {
    if (!allowedInput.trim()) return;
    setPg(p => ({ ...p, thingsToKnow: { ...p.thingsToKnow, allowed: [...p.thingsToKnow.allowed, allowedInput.trim()] } }));
    setAllowedInput("");
  }

  function addNotAllowed() {
    if (!notAllowedInput.trim()) return;
    setPg(p => ({ ...p, thingsToKnow: { ...p.thingsToKnow, notAllowed: [...p.thingsToKnow.notAllowed, notAllowedInput.trim()] } }));
    setNotAllowedInput("");
  }

  function updateRoom(i: number, key: keyof RoomData, value: unknown) {
    setRooms(prev => prev.map((r, idx) => idx === i ? { ...r, [key]: value } : r));
  }

  function toggleRoomAmenity(ri: number, a: string) {
    setRooms(prev => prev.map((r, i) => i === ri ? {
      ...r, amenities: r.amenities.includes(a) ? r.amenities.filter(x => x !== a) : [...r.amenities, a]
    } : r));
  }

  function addRoom() {
    setRooms(prev => [...prev, { type: "Single", pricePerBed: 0, amenities: [], existingImages: [], keepImageIds: [], newImages: [] }]);
  }

  // Append picked room images (no replace, no dedupe, no cap).
  function addRoomImages(ri: number, fileList: FileList | null) {
    const picked = fileList ? Array.from(fileList) : [];
    if (picked.length === 0) return;
    setRooms(prev => prev.map((r, i) => i === ri ? { ...r, newImages: [...r.newImages, ...picked] } : r));
  }

  function removeNewRoomImage(ri: number, imgIdx: number) {
    setRooms(prev => prev.map((r, i) => i === ri ? { ...r, newImages: r.newImages.filter((_, j) => j !== imgIdx) } : r));
  }

  function toggleKeepRoomImage(ri: number, publicId: string) {
    setRooms(prev => prev.map((r, i) => {
      if (i !== ri) return r;
      const kept = r.keepImageIds.includes(publicId);
      return { ...r, keepImageIds: kept ? r.keepImageIds.filter(id => id !== publicId) : [...r.keepImageIds, publicId] };
    }));
  }

  function removeRoom(i: number) {
    setRooms(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const data = {
        ...pg,
        mapLat: pg.mapLat ? Number(pg.mapLat) : undefined,
        mapLng: pg.mapLng ? Number(pg.mapLng) : undefined,
        // Per room, keep only the existing images the admin didn't delete.
        rooms: rooms.map(r => ({
          type: r.type,
          pricePerBed: r.pricePerBed,
          amenities: r.amenities,
          keepImageIds: r.keepImageIds,
        })),
        keepImages,
      };

      const form = new FormData();
      form.append("data", JSON.stringify(data));
      // PG cover images.
      coverImages.forEach(f => form.append("images", f));
      // Room images, tagged by room index so the backend can attach each to the
      // right room (field name: roomImages_<index>).
      rooms.forEach((r, ri) => {
        r.newImages.forEach(f => form.append(`roomImages_${ri}`, f));
      });

      const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/api/pgs/${existing!._id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/pgs`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error);
      }

      const saved = await res.json();
      router.push(`/pgs/${saved._id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

      <FormSection title="Basic Info">
        <Field label="PG Name" required>
          <input value={pg.name} onChange={e => field("name", e.target.value)} required className={input} placeholder="e.g. Sunrise Girls PG" />
        </Field>
        <Field label="Location / Area" required>
          <input value={pg.location} onChange={e => field("location", e.target.value)} required className={input} placeholder="e.g. Shakti Nagar" />
        </Field>
        <Field label="PG For" required>
          <select value={pg.pgFor} onChange={e => field("pgFor", e.target.value)} className={input}>
            <option>Girls</option><option>Boys</option><option>Both</option>
          </select>
        </Field>
        <Field label="Publish">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={pg.isPublished} onChange={e => field("isPublished", e.target.checked)} className="w-4 h-4 accent-slate-900" />
            <span className="text-sm text-slate-700">Published (visible on listings)</span>
          </label>
        </Field>
      </FormSection>

      <FormSection title="Meals">
        <div className="flex gap-2 flex-wrap">
          {MEAL_LIST.map(m => (
            <button type="button" key={m} onClick={() => toggleMeal(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${pg.mealTypes.includes(m) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
              {m}
            </button>
          ))}
        </div>
      </FormSection>

      <FormSection title="Images">
        {(() => {
          const keptCount = isEdit ? keepImages.length : 0;
          const total = keptCount + coverImages.length;
          return (
            <>
              <label className="inline-flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-lg transition-colors bg-slate-900 text-white cursor-pointer hover:bg-slate-700">
                + Add Images
                <input type="file" multiple accept="image/*" className="hidden"
                  onChange={e => {
                    const input = e.currentTarget;
                    try {
                      addCoverImages(input.files);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Could not add images");
                    } finally {
                      input.value = ""; // allow re-picking the same file
                    }
                  }} />
              </label>
              <p className="text-xs text-slate-500 mt-2">
                {total} image{total !== 1 ? "s" : ""} ({keptCount} existing + {coverImages.length} new) · add as many as you like
              </p>
              {error && (
                <p className="text-xs text-red-500 mt-1 bg-red-50 border border-red-100 rounded-lg px-2 py-1">{error}</p>
              )}

              {/* existing images (edit mode) — kept images shown; deleting removes them from the strip */}
              {isEdit && existing!.images.length > 0 && (() => {
                const keptImgs = existing!.images.filter(img => keepImages.includes(img.publicId));
                const removedImgs = existing!.images.filter(img => !keepImages.includes(img.publicId));
                return (
                  <>
                    {keptImgs.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 mb-2">Current images:</p>
                        <div className="flex gap-2 flex-wrap">
                          {keptImgs.map(img => (
                            <div key={img.publicId} className="relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.url} alt="" className="w-20 h-16 object-cover rounded-lg border-2 border-slate-900" />
                              <button type="button"
                                onClick={() => setKeepImages(prev => prev.filter(p => p !== img.publicId))}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-xs text-slate-600 hover:bg-red-50 hover:text-red-500"
                                title="Delete image">
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {removedImgs.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-red-500 mb-2">Will be deleted on save ({removedImgs.length}):</p>
                        <div className="flex gap-2 flex-wrap">
                          {removedImgs.map(img => (
                            <div key={img.publicId} className="relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.url} alt="" className="w-20 h-16 object-cover rounded-lg border-2 border-red-200 opacity-40" />
                              <button type="button"
                                onClick={() => setKeepImages(prev => [...prev, img.publicId])}
                                className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-700 bg-white/60 rounded-lg hover:bg-white/80"
                                title="Undo — keep this image">
                                ↺ Undo
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* newly selected images — previews with remove */}
              {coverImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-2">New images to upload:</p>
                  <div className="flex gap-2 flex-wrap">
                    {coverImages.map((file, i) => (
                      <div key={`${file.name}-${i}`} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coverPreviews[i]} alt={file.name} className="w-20 h-16 object-cover rounded-lg border-2 border-indigo-400" />
                        <button type="button" onClick={() => removeCoverImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-xs text-slate-600 hover:bg-red-50 hover:text-red-500"
                          title="Remove">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </FormSection>

      <FormSection title="Common Amenities">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AMENITY_LIST.map(a => (
            <label key={a} className="flex items-center gap-2 cursor-pointer py-1">
              <input type="checkbox" checked={pg.commonAmenities.includes(a)} onChange={() => toggleAmenity(a)} className="w-3.5 h-3.5 accent-slate-900" />
              <span className="text-sm text-slate-700">{a}</span>
            </label>
          ))}
        </div>
      </FormSection>

      <FormSection title="Things to Know">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">✓ Allowed</p>
            <div className="flex gap-2 mb-2">
              <input value={allowedInput} onChange={e => setAllowedInput(e.target.value)} className={`${input} flex-1`} placeholder="e.g. Food is available" />
              <button type="button" onClick={addAllowed} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm">Add</button>
            </div>
            <div className="space-y-1">
              {pg.thingsToKnow.allowed.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg">
                  <span>{t}</span>
                  <button type="button" onClick={() => setPg(p => ({ ...p, thingsToKnow: { ...p.thingsToKnow, allowed: p.thingsToKnow.allowed.filter((_, j) => j !== i) } }))} className="text-green-400 hover:text-red-500 ml-2">✕</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">✗ Not Allowed</p>
            <div className="flex gap-2 mb-2">
              <input value={notAllowedInput} onChange={e => setNotAllowedInput(e.target.value)} className={`${input} flex-1`} placeholder="e.g. Opposite gender not allowed" />
              <button type="button" onClick={addNotAllowed} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm">Add</button>
            </div>
            <div className="space-y-1">
              {pg.thingsToKnow.notAllowed.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg">
                  <span>{t}</span>
                  <button type="button" onClick={() => setPg(p => ({ ...p, thingsToKnow: { ...p.thingsToKnow, notAllowed: p.thingsToKnow.notAllowed.filter((_, j) => j !== i) } }))} className="text-red-300 hover:text-red-600 ml-2">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Map Location (Optional)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Latitude">
            <input value={pg.mapLat} onChange={e => field("mapLat", e.target.value)} className={input} placeholder="e.g. 28.6892" type="number" step="any" />
          </Field>
          <Field label="Longitude">
            <input value={pg.mapLng} onChange={e => field("mapLng", e.target.value)} className={input} placeholder="e.g. 77.2025" type="number" step="any" />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Rooms Offered">
        <div className="space-y-5">
          {rooms.map((room, ri) => (
            <div key={ri} className="border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Room {ri + 1}</h3>
                {rooms.length > 1 && (
                  <button type="button" onClick={() => removeRoom(ri)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Room Type">
                  <select value={room.type} onChange={e => updateRoom(ri, "type", e.target.value as "Single" | "Double" | "Triple")} className={input}>
                    {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Price per Bed (₹/month)">
                  <input type="number" value={room.pricePerBed || ""} onChange={e => updateRoom(ri, "pricePerBed", Number(e.target.value))} className={input} placeholder="e.g. 12000" />
                </Field>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Room Amenities</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {AMENITY_LIST.map(a => (
                    <label key={a} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={room.amenities.includes(a)} onChange={() => toggleRoomAmenity(ri, a)} className="w-3 h-3 accent-slate-900" />
                      <span className="text-xs text-slate-600">{a}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Room Images</p>
                <label className="inline-flex items-center gap-2 text-xs font-medium py-1.5 px-3 rounded-lg bg-slate-100 text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors">
                  + Add Room Images
                  <input type="file" multiple accept="image/*" className="hidden"
                    onChange={e => { const inp = e.currentTarget; addRoomImages(ri, inp.files); inp.value = ""; }} />
                </label>

                {/* existing room images (edit) — click × to delete */}
                {room.existingImages.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {room.existingImages.map(img => {
                      const kept = room.keepImageIds.includes(img.publicId);
                      return (
                        <div key={img.publicId} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt="" className={`w-16 h-12 object-cover rounded-lg border transition-all ${kept ? "border-slate-200 opacity-100" : "border-red-200 opacity-40"}`} />
                          <button type="button" onClick={() => toggleKeepRoomImage(ri, img.publicId)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-[10px] text-slate-600 hover:bg-slate-100"
                            title={kept ? "Delete image" : "Undo — keep image"}>
                            {kept ? "×" : "↺"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* newly picked room images — previews with remove */}
                {room.newImages.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {room.newImages.map((file, imgIdx) => (
                      <div key={`${file.name}-${imgIdx}`} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={roomPreviews[ri]?.[imgIdx]} alt={file.name} className="w-16 h-12 object-cover rounded-lg border-2 border-indigo-400" />
                        <button type="button" onClick={() => removeNewRoomImage(ri, imgIdx)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-[10px] text-slate-600 hover:bg-red-50 hover:text-red-500"
                          title="Remove">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addRoom}
            className="w-full py-2.5 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:border-slate-400 hover:text-slate-700 transition-colors">
            + Add Room Type
          </button>
        </div>
      </FormSection>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50">
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create PG"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

const input = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white";

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}{required && " *"}
      </label>
      {children}
    </div>
  );
}
