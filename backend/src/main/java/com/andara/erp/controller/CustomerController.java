package com.andara.erp.controller;

import com.andara.erp.common.dto.ApiResponse;
import com.andara.erp.dto.customer.CreateCustomerRequest;
import com.andara.erp.dto.customer.CustomerDTO;
import com.andara.erp.dto.customer.UpdateCustomerRequest;
import com.andara.erp.service.CustomerService;
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
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ApiResponse<Page<CustomerDTO>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<CustomerDTO> customers = customerService.getCustomers(search, isActive, pageable);
        return ApiResponse.success(customers);
    }

    @GetMapping("/active")
    public ApiResponse<List<CustomerDTO>> getActiveCustomers() {
        List<CustomerDTO> activeCustomers = customerService.getActiveCustomers();
        return ApiResponse.success(activeCustomers);
    }

    @GetMapping("/{id}")
    public ApiResponse<CustomerDTO> getCustomerById(@PathVariable Long id) {
        CustomerDTO customer = customerService.getCustomerById(id);
        return ApiResponse.success(customer);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerDTO>> createCustomer(
            @Valid @RequestBody CreateCustomerRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        CustomerDTO created = customerService.createCustomer(request, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Customer berhasil ditambahkan"));
    }

    @PutMapping("/{id}")
    public ApiResponse<CustomerDTO> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        CustomerDTO updated = customerService.updateCustomer(id, request, username);
        return ApiResponse.success(updated, "Data customer berhasil diperbarui");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ApiResponse.success(null, "Customer berhasil dinonaktifkan");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<CustomerDTO> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean active,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        CustomerDTO updated = customerService.toggleCustomerStatus(id, active, username);
        String msg = active ? "Customer berhasil diaktifkan" : "Customer berhasil dinonaktifkan";
        return ApiResponse.success(updated, msg);
    }
}
