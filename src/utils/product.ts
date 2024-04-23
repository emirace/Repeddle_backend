import Product from '../model/product';

export const generateUniqueSlug = async (name: string): Promise<string> => {
  let slug = name.replace(/\s+/g, '-').toLowerCase();
  let suffix = 1;
  let slugExists = await Product.findOne({ slug });

  while (slugExists) {
    // If slug exists, append a unique suffix until it's unique
    slug = `${slug}-${suffix}`;
    slugExists = await Product.findOne({ slug });
    suffix++;
  }

  return slug;
};
