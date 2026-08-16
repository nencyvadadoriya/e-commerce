export type CategoryGroup = { title: string; items: string[] }

export const categoryNavigation: Record<string, CategoryGroup[]> = {
  men: [
    { title: 'Clothing', items: ['Shirts', 'T-Shirts', 'Jeans', 'Jackets'] },
    { title: 'Footwear', items: ['Casual Shoes', 'Sports Shoes', 'Sandals', 'Sneakers'] },
    { title: 'Accessories', items: ['Backpacks', 'Belts', 'Wallets', 'Sunglasses'] },
  ],
  women: [
    { title: 'Indian & Fusion', items: ['Dresses', 'Tops', 'Sarees', 'Kurtas'] },
    { title: 'Western Wear', items: ['Jeans', 'Trousers', 'Co-ords', 'Jumpsuits'] },
    { title: 'Beauty & Accessories', items: ['Jewellery', 'Handbags', 'Makeup', 'Fragrances'] },
  ],
  kids: [
    { title: 'Boys Clothing', items: ['T-Shirts', 'Shirts', 'Shorts', 'Jeans'] },
    { title: 'Girls Clothing', items: ['Dresses', 'Tops', 'Skirts', 'Clothing Sets'] },
    { title: 'Kids Essentials', items: ['Footwear', 'Toys', 'Bags', 'Watches'] },
  ],
  home: [
    { title: 'Home Décor', items: ['Plants', 'Candles', 'Clocks', 'Mirrors'] },
    { title: 'Kitchen & Table', items: ['Dinnerware', 'Cookware', 'Mugs', 'Storage'] },
    { title: 'Bath & Living', items: ['Towels', 'Bath Rugs', 'Cushions', 'Curtains'] },
  ],
  beauty: [
    { title: 'Makeup', items: ['Lipstick', 'Lip Gloss', 'Eyeliner', 'Foundation'] },
    { title: 'Skincare, Bath & Body', items: ['Moisturiser', 'Cleanser', 'Sunscreen', 'Body Lotion'] },
    { title: 'Haircare', items: ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Serum'] },
  ],
  genz: [
    { title: 'Trending Fits', items: ['Dresses', 'Tops', 'T-Shirts', 'Co-ords'] },
    { title: 'Active & Occasion', items: ['Activewear', 'Party Wear', 'Sneakers', 'Jackets'] },
    { title: 'Finishing Touches', items: ['Jewellery', 'Backpacks', 'Makeup', 'Sunglasses'] },
  ],
}

export const categorySlugs = Object.keys(categoryNavigation)
export const slugify = (value: string) => value.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-')
export const categoryLabel = (slug: string) => slug.charAt(0).toUpperCase() + slug.slice(1)
export function isValidCategory(slug: string) { return categorySlugs.includes(slug) }
export function isValidSubcategory(category: string, subcategory: string) { return categoryNavigation[category]?.some((group) => group.items.some((item) => slugify(item) === subcategory)) ?? false }
export function allSubcategories(category: string) { return categoryNavigation[category]?.flatMap((group) => group.items) ?? [] }
