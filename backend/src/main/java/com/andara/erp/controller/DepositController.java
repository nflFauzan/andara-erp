package com.andara.erp.controller;

import com.andara.erp.common.dto.ApiResponse;
import com.andara.erp.dto.deposit.CustomerDepositSummaryDTO;
import com.andara.erp.dto.deposit.DepositTransactionDTO;
import com.andara.erp.dto.deposit.UseDepositRequest;
import com.andara.erp.service.DepositService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/deposits")
public class DepositController {

    private final DepositService depositService;

    public DepositController(DepositService depositService) {
        this.depositService = depositService;
    }

    @GetMapping
    public ApiResponse<List<CustomerDepositSummaryDTO>> getAllCustomerDeposits() {
        List<CustomerDepositSummaryDTO> summaries = depositService.getAllCustomerDeposits();
        return ApiResponse.success(summaries);
    }

    @GetMapping("/customer/{customerId}")
    public ApiResponse<Page<DepositTransactionDTO>> getCustomerDepositHistory(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<DepositTransactionDTO> history = depositService.getCustomerDepositHistory(customerId, pageable);
        return ApiResponse.success(history);
    }

    @GetMapping("/customer/{customerId}/balance")
    public ApiResponse<BigDecimal> getCustomerDepositBalance(@PathVariable Long customerId) {
        BigDecimal balance = depositService.getDepositBalance(customerId);
        return ApiResponse.success(balance);
    }

    @PostMapping("/use")
    @PreAuthorize("hasRole('OPERATOR')")
    public ApiResponse<DepositTransactionDTO> useDeposit(
            @Valid @RequestBody UseDepositRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "operator";
        DepositTransactionDTO result = depositService.useDeposit(request, username);
        return ApiResponse.success(result, "Deposit berhasil dialokasikan ke faktur");
    }
}
