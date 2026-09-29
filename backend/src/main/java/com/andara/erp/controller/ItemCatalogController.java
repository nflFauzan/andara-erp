package com.andara.erp.controller;

import com.andara.erp.common.dto.ApiResponse;
import com.andara.erp.dto.itemcatalog.CreateItemCatalogRequest;
import com.andara.erp.dto.itemcatalog.ItemCatalogDTO;
import com.andara.erp.dto.itemcatalog.UpdateItemCatalogRequest;
import com.andara.erp.service.ItemCatalogService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master-items")
public class ItemCatalogController {

    private final ItemCatalogService itemCatalogService;

    public ItemCatalogController(ItemCatalogService itemCatalogService) {
        this.itemCatalogService = itemCatalogService;
    }

    @GetMapping
    public ApiResponse<Page<ItemCatalogDTO>> getItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ItemCatalogDTO> items = itemCatalogService.getItems(search, category, isActive, pageable);
        return ApiResponse.success(items);
    }

    @GetMapping("/active")
    public ApiResponse<List<ItemCatalogDTO>> getActiveItems() {
        List<ItemCatalogDTO> items = itemCatalogService.getActiveItems();
        return ApiResponse.success(items);
    }

    @GetMapping("/categories")
    public ApiResponse<List<String>> getCategories() {
        List<String> categories = itemCatalogService.getCategories();
        return ApiResponse.success(categories);
    }

    @GetMapping("/{id}")
    public ApiResponse<ItemCatalogDTO> getItemById(@PathVariable Long id) {
        ItemCatalogDTO item = itemCatalogService.getItemById(id);
        return ApiResponse.success(item);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ItemCatalogDTO>> createItem(
            @Valid @RequestBody CreateItemCatalogRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        ItemCatalogDTO created = itemCatalogService.createItem(request, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Item master berhasil ditambahkan"));
    }

    @PutMapping("/{id}")
    public ApiResponse<ItemCatalogDTO> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateItemCatalogRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        ItemCatalogDTO updated = itemCatalogService.updateItem(id, request, username);
        return ApiResponse.success(updated, "Item master berhasil diperbarui");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteItem(@PathVariable Long id) {
        itemCatalogService.deleteItem(id);
        return ApiResponse.success(null, "Item master berhasil dinonaktifkan");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<ItemCatalogDTO> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean active,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        ItemCatalogDTO updated = itemCatalogService.toggleItemStatus(id, active, username);
        String msg = active ? "Item master berhasil diaktifkan" : "Item master berhasil dinonaktifkan";
        return ApiResponse.success(updated, msg);
    }
}
