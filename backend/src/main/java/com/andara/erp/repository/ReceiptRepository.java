package com.andara.erp.repository;

import com.andara.erp.entity.Receipt;
import com.andara.erp.entity.ReceiptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {

    Optional<Receipt> findByNumber(String number);

    Optional<Receipt> findByPaymentId(Long paymentId);

    boolean existsByPaymentId(Long paymentId);

    boolean existsByNumber(String number);

    @Query("SELECT r FROM Receipt r " +
            "JOIN r.payment p " +
            "JOIN p.customer c " +
            "WHERE (:customerId IS NULL OR p.customer.id = :customerId) " +
            "AND (:status IS NULL OR r.status = :status) " +
            "AND (:startDate IS NULL OR r.date >= :startDate) " +
            "AND (:endDate IS NULL OR r.date <= :endDate) " +
            "AND (:searchPattern IS NULL OR (" +
            "   LOWER(r.number) LIKE :searchPattern OR " +
            "   LOWER(p.number) LIKE :searchPattern OR " +
            "   LOWER(r.receivedFrom) LIKE :searchPattern OR " +
            "   LOWER(c.name) LIKE :searchPattern OR " +
            "   LOWER(c.code) LIKE :searchPattern OR " +
            "   LOWER(r.description) LIKE :searchPattern OR " +
            "   LOWER(r.notes) LIKE :searchPattern" +
            "))")
    Page<Receipt> findWithFilters(
            @Param("searchPattern") String searchPattern,
            @Param("customerId") Long customerId,
            @Param("status") ReceiptStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );
}
