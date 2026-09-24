package com.andara.erp.service;

import com.andara.erp.common.exception.AppException;
import com.andara.erp.common.exception.ErrorCode;
import com.andara.erp.dto.customer.CreateCustomerRequest;
import com.andara.erp.dto.customer.CustomerDTO;
import com.andara.erp.dto.customer.UpdateCustomerRequest;
import com.andara.erp.entity.Customer;
import com.andara.erp.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public Page<CustomerDTO> getCustomers(String search, Boolean isActive, Pageable pageable) {
        return customerRepository.searchCustomers(search, isActive, pageable)
                .map(CustomerDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan dengan ID: " + id));
        return CustomerDTO.fromEntity(customer);
    }

    @Transactional(readOnly = true)
    public List<CustomerDTO> getActiveCustomers() {
        return customerRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(CustomerDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerDTO createCustomer(CreateCustomerRequest request, String currentUsername) {
        if (customerRepository.existsByCodeIgnoreCase(request.getCode().trim())) {
            throw new AppException(ErrorCode.CONFLICT, "Kode customer '" + request.getCode() + "' sudah terdaftar.");
        }

        Customer customer = new Customer(
                request.getCode().trim().toUpperCase(),
                request.getName().trim(),
                request.getCompanyName() != null ? request.getCompanyName().trim() : null,
                request.getAddress() != null ? request.getAddress().trim() : null,
                request.getPhone() != null ? request.getPhone().trim() : null,
                request.getEmail() != null ? request.getEmail().trim() : null,
                request.getPicName() != null ? request.getPicName().trim() : null,
                request.getNotes() != null ? request.getNotes().trim() : null,
                currentUsername
        );

        Customer saved = customerRepository.save(customer);
        return CustomerDTO.fromEntity(saved);
    }

    @Transactional
    public CustomerDTO updateCustomer(Long id, UpdateCustomerRequest request, String currentUsername) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan dengan ID: " + id));

        String newCode = request.getCode().trim().toUpperCase();
        if (customerRepository.existsByCodeIgnoreCaseAndIdNot(newCode, id)) {
            throw new AppException(ErrorCode.CONFLICT, "Kode customer '" + newCode + "' sudah digunakan oleh customer lain.");
        }

        customer.setCode(newCode);
        customer.setName(request.getName().trim());
        customer.setCompanyName(request.getCompanyName() != null ? request.getCompanyName().trim() : null);
        customer.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        customer.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        customer.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        customer.setPicName(request.getPicName() != null ? request.getPicName().trim() : null);
        customer.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        customer.setUpdatedBy(currentUsername);

        if (request.getActive() != null) {
            customer.setActive(request.getActive());
        }

        // CRITICAL: depositBalance is NOT updated directly here. It is ledger-controlled only!
        Customer updated = customerRepository.save(customer);
        return CustomerDTO.fromEntity(updated);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan dengan ID: " + id));

        // Soft-delete: deactivate customer to preserve historical transaction integrity
        customer.setActive(false);
        customerRepository.save(customer);
    }

    @Transactional
    public CustomerDTO toggleCustomerStatus(Long id, boolean active, String currentUsername) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan dengan ID: " + id));

        customer.setActive(active);
        customer.setUpdatedBy(currentUsername);
        Customer updated = customerRepository.save(customer);
        return CustomerDTO.fromEntity(updated);
    }
}
