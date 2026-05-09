import { useEffect, useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { US_STATES, CITIES_BY_STATE, validateZip, getCitiesForState } from "@/lib/us-address-data";

export type AddressData = {
  address: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type Props = {
  value: AddressData;
  onChange: (v: AddressData) => void;
  errors?: Record<string, string>;
  /** If true, shows Address Line 2 field */
  showAddress2?: boolean;
};

export function USAddressFields({ value, onChange, errors = {}, showAddress2 = true }: Props) {
  const datalistId = useId();

  const cities = getCitiesForState(value.state);

  const handleStateChange = (newState: string) => {
    const newCities = getCitiesForState(newState);
    // If current city not in the new state's list, clear it
    const cityStillValid = !value.city || newCities.includes(value.city);
    onChange({
      ...value,
      state: newState,
      city: cityStillValid ? value.city : "",
      country: "United States",
    });
  };

  return (
    <div className="space-y-3">
      {/* Hidden country field — always United States */}
      <input type="hidden" name="country" value="United States" />

      {/* Address Line 1 */}
      <div>
        <Label htmlFor="addr-line1">
          Street Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="addr-line1"
          value={value.address}
          onChange={e => onChange({ ...value, address: e.target.value })}
          placeholder="123 Main St"
          className={errors.address ? "border-destructive" : ""}
          autoComplete="address-line1"
        />
        {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
      </div>

      {/* Address Line 2 (optional) */}
      {showAddress2 && (
        <div>
          <Label htmlFor="addr-line2">Apt, Suite, Unit (optional)</Label>
          <Input
            id="addr-line2"
            value={value.address2}
            onChange={e => onChange({ ...value, address2: e.target.value })}
            placeholder="Apt 4B"
            autoComplete="address-line2"
          />
        </div>
      )}

      {/* State dropdown */}
      <div>
        <Label htmlFor="addr-state">
          State <span className="text-destructive">*</span>
        </Label>
        <select
          id="addr-state"
          value={value.state}
          onChange={e => handleStateChange(e.target.value)}
          autoComplete="address-level1"
          className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            errors.state ? "border-destructive" : "border-input"
          }`}
        >
          <option value="">Select state…</option>
          {US_STATES.map(s => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
        {errors.state && <p className="text-xs text-destructive mt-1">{errors.state}</p>}
      </div>

      {/* City — input with datalist autocomplete */}
      <div>
        <Label htmlFor="addr-city">
          City <span className="text-destructive">*</span>
        </Label>
        <Input
          id="addr-city"
          list={`${datalistId}-cities`}
          value={value.city}
          onChange={e => onChange({ ...value, city: e.target.value })}
          placeholder={value.state ? "Type or select city…" : "Select state first"}
          disabled={false}
          className={errors.city ? "border-destructive" : ""}
          autoComplete="address-level2"
        />
        <datalist id={`${datalistId}-cities`}>
          {cities.map(c => (
            <option key={c} value={c} />
          ))}
        </datalist>
        {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
      </div>

      {/* ZIP */}
      <div>
        <Label htmlFor="addr-zip">
          ZIP Code <span className="text-destructive">*</span>
        </Label>
        <Input
          id="addr-zip"
          value={value.zip}
          onChange={e => onChange({ ...value, zip: e.target.value })}
          placeholder="12345 or 12345-6789"
          maxLength={10}
          className={errors.zip ? "border-destructive" : ""}
          autoComplete="postal-code"
        />
        {errors.zip && <p className="text-xs text-destructive mt-1">{errors.zip}</p>}
        {!errors.zip && value.zip && !validateZip(value.zip) && (
          <p className="text-xs text-amber-500 mt-1">ZIP format: 5 digits or 12345-6789</p>
        )}
      </div>

      {/* Country (display only) */}
      <div>
        <Label>Country</Label>
        <Input value="United States" disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
      </div>
    </div>
  );
}
