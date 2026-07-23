import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Share, Heart, ChevronsUpDown, Info, ShoppingCart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-viewport";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WebTopBar } from "@/components/web/top-bar";
import { WebEmployeeNav } from "@/components/web/employee-nav";
import { getProduct, MY_POINTS } from "@/lib/rewards-data";

export default function ProductDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const product = useMemo(() => getProduct(id), [id]);
  const { toast } = useToast();
  const [size, setSize] = useState<string | undefined>(product?.sizes?.[Math.floor((product?.sizes?.length ?? 1) / 2)]);
  const [color, setColor] = useState<string | undefined>(product?.colors?.[0]?.name);
  const [favorite, setFavorite] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-6 text-center">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Reward not found.</p>
          <Link to="/m/rewards" className="text-sm text-primary underline">
            Back to Rewards
          </Link>
        </div>
      </div>
    );
  }

  const canAfford = MY_POINTS >= product.points;

  function redeem() {
    if (!canAfford) {
      toast({ title: "Not enough points", description: `You need ${(product!.points - MY_POINTS).toLocaleString()} more.` });
      return;
    }
    toast({ title: "Redemption requested", description: `${product!.name} — pending fulfillment.` });
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-muted font-mobile flex flex-col">
        <main className="flex-1 px-4 pt-3 pb-32">
          <ProductCard
            product={product}
            favorite={favorite}
            onFavorite={() => setFavorite((v) => !v)}
            onBack={() => navigate(-1)}
          />
          <ProductOptions
            product={product}
            size={size}
            setSize={setSize}
            color={color}
            setColor={setColor}
          />
          <ProductDetails product={product} />
        </main>
        <RedeemFooter product={product} canAfford={canAfford} onRedeem={redeem} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted font-mobile">
      <WebTopBar />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-12 gap-6 pt-4 pb-12">
          <div className="col-span-3">
            <WebEmployeeNav />
          </div>
          <div className="col-span-9">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Rewards
            </button>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-7">
                <ProductCard
                  product={product}
                  favorite={favorite}
                  onFavorite={() => setFavorite((v) => !v)}
                  onBack={() => navigate(-1)}
                  hideBack
                />
              </div>
              <div className="col-span-5">
                <ProductOptions
                  product={product}
                  size={size}
                  setSize={setSize}
                  color={color}
                  setColor={setColor}
                />
                <ProductDetails product={product} />
                <RedeemFooter
                  product={product}
                  canAfford={canAfford}
                  onRedeem={redeem}
                  inline
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  favorite,
  onFavorite,
  onBack,
  hideBack,
}: {
  product: ReturnType<typeof getProduct> & object;
  favorite: boolean;
  onFavorite: () => void;
  onBack: () => void;
  hideBack?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between">
        {!hideBack ? (
          <button
            onClick={onBack}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-muted hover:bg-muted flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <button
            aria-label="Share"
            className="w-9 h-9 rounded-full bg-muted hover:bg-muted flex items-center justify-center"
          >
            <Share className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            aria-label="Favorite"
            onClick={onFavorite}
            className="w-9 h-9 rounded-full bg-muted hover:bg-muted flex items-center justify-center"
          >
            <Heart className={`w-4 h-4 ${favorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
          </button>
        </div>
      </div>

      <h1 className="font-mobile text-2xl font-semibold text-foreground mt-3 mb-4">
        {product.name}
      </h1>

      <div
        className="aspect-square rounded-2xl flex items-center justify-center overflow-hidden"
        style={{ background: product.imageBg }}
      >
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <div className="text-center px-6">
            <p className="text-xs uppercase tracking-wider text-white/70">{product.brand}</p>
            <p className="font-mobile font-semibold text-white text-lg mt-1">{product.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OptionRow({
  iconSlot,
  label,
  value,
  options,
  onChange,
}: {
  iconSlot: React.ReactNode;
  label: string;
  value?: string;
  options?: string[];
  onChange?: (v: string) => void;
}) {
  if (!options || options.length === 0) {
    return (
      <div className="flex items-center justify-between py-3.5 px-1">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 flex items-center justify-center text-muted-foreground">{iconSlot}</span>
          <span className="text-sm font-medium text-foreground">
            {label} <span className="text-muted-foreground">(N/A)</span>
          </span>
        </div>
      </div>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full flex items-center justify-between py-3.5 px-1 hover:bg-muted rounded-lg transition-colors">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 flex items-center justify-center text-muted-foreground">{iconSlot}</span>
          <span className="text-sm font-medium text-foreground">
            {label} <span className="text-muted-foreground">({value ?? "—"})</span>
          </span>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {options.map((opt) => (
          <DropdownMenuItem key={opt} onClick={() => onChange?.(opt)}>
            {opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProductOptions({
  product,
  size,
  setSize,
  color,
  setColor,
}: {
  product: ReturnType<typeof getProduct> & object;
  size?: string;
  setSize: (v: string) => void;
  color?: string;
  setColor: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl p-3 mb-4 divide-y divide-border">
      <OptionRow
        iconSlot={<SizeIcon />}
        label="Size"
        value={size}
        options={product.sizes}
        onChange={setSize}
      />
      <OptionRow
        iconSlot={<ColorIcon />}
        label="Color"
        value={color}
        options={product.colors?.map((c) => c.name)}
        onChange={setColor}
      />
    </div>
  );
}

function ProductDetails({ product }: { product: ReturnType<typeof getProduct> & object }) {
  return (
    <div className="bg-white rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mobile font-semibold text-foreground">Details</h3>
        <button aria-label="More info" className="w-7 h-7 rounded-full border border-border flex items-center justify-center">
          <Info className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      {product.description && (
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{product.description}</p>
      )}
      {product.brand && (
        <p className="text-xs text-muted-foreground mt-2">
          <span className="font-medium text-muted-foreground">Brand:</span> {product.brand}
        </p>
      )}
    </div>
  );
}

function RedeemFooter({
  product,
  canAfford,
  onRedeem,
  inline,
}: {
  product: ReturnType<typeof getProduct> & object;
  canAfford: boolean;
  onRedeem: () => void;
  inline?: boolean;
}) {
  const content = (
    <div className="bg-primary/10 rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-mobile text-2xl font-semibold text-foreground leading-none">
          {product.points.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground mt-1">points</p>
      </div>
      <button
        onClick={onRedeem}
        disabled={!canAfford}
        className={`inline-flex items-center gap-2 h-12 px-5 rounded-full font-mobile font-semibold text-sm transition-colors ${
          canAfford
            ? "bg-[#ef6757] hover:bg-[#dc5444] text-white"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        <ShoppingCart className="w-4 h-4" />
        {canAfford ? "Redeem" : "Not enough"}
      </button>
    </div>
  );

  if (inline) return <div className="mt-2">{content}</div>;

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-muted px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
      {content}
      {!canAfford && (
        <p className="mt-2 text-xs text-center text-muted-foreground inline-flex items-center gap-1 justify-center w-full">
          <Sparkles className="w-3 h-3" />
          You're {(product.points - MY_POINTS).toLocaleString()} points short.
        </p>
      )}
    </div>
  );
}

function SizeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="6" y="3" width="4" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="3" width="4" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ColorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle cx="9" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
