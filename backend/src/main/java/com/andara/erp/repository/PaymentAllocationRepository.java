package com.andara.erp.repository;

import com.andara.erp.entity.PaymentAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentAllocationRepository extends JpaRepository<PaymentAllocation, Long> {

    List<PaymentAllocation> findByPaymentId(Long paymentId);

    List<PaymentAllocation> findByInvoiceId(Long invoiceId);

    @Query("SELECT COALESCE(SUM(a.amount), 0) FROM PaymentAllocation a " +
            "WHERE a.invoice.id = :invoiceId " +
            "AND a.payment.status != com.andara.erp.entity.PaymentStatus.CANCELLED")
    BigDecimal sumAllocatedAmountByInvoiceId(@Param("invoiceId") Long invoiceId);

    @Query("SELECT COALESCE(SUM(a.amount), 0) FROM PaymentAllocation a " +
            "WHERE a.payment.id = :paymentId")
    BigDecimal sumAllocatedAmountByPaymentId(@Param("paymentId") Long paymentId);

    @Query("SELECT COALESCE(SUM(a.amount), 0) FROM PaymentAllocation a " +
            "WHERE a.payment.status = 'CONFIRMED' " +
            "AND a.payment.date BETWEEN :startDate AND :endDate")
    BigDecimal sumAllocatedConfirmedByDateRange(
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(a.amount), 0) FROM PaymentAllocation a " +
            "WHERE a.payment.status = 'CONFIRMED' " +
            "AND a.payment.customer.id = :customerId " +
            "AND a.payment.date BETWEEN :startDate AND :endDate")
    BigDecimal sumAllocatedConfirmedByCustomerIdAndDateRange(
            @Param("customerId") Long customerId,
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate
    );
}
