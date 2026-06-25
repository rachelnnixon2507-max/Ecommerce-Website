using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .ToListAsync();

        return Ok(products);
    }

    // GET: api/products/1
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound();

        return Ok(product);
    }

    // POST: api/products
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
{
    if (product.CategoryId.HasValue)
    {
        var categoryExists = await _context.Categories
            .AnyAsync(c => c.Id == product.CategoryId);

        if (!categoryExists)
        {
            return BadRequest("Invalid Category Id");
        }
    }

    _context.Products.Add(product);

    await _context.SaveChangesAsync();

    return Ok(product);
}
        
    // DELETE: api/products/1
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
            return NotFound();

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return Ok("Deleted successfully");
    }
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(
    int id,
    Product updatedProduct)
{
    var product =
        await _context.Products.FindAsync(id);

    if (product == null)
        return NotFound();

    product.Name = updatedProduct.Name;
    product.Description = updatedProduct.Description;
    product.Price = updatedProduct.Price;
    product.Stock = updatedProduct.Stock;
    product.ImageUrl = updatedProduct.ImageUrl;
    product.CategoryId = updatedProduct.CategoryId;

    await _context.SaveChangesAsync();

    return Ok(product);
}
}