package com.andara.erp.repository;

import com.andara.erp.entity.Penawaran;
import com.andara.erp.entity.PenawaranStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PenawaranRepository extends JpaRepository<Penawaran, Long> {

    Optional<Penawaran> findByNumber(String number);

    boolean existsByNumber(String number);

    List<Penawaran> findByCustomerIdOrderByDateDesc(Long customerId);

    @Query("SELECT p FROM Penawaran p " +
            "JOIN p.customer c " +
            "WHERE (:customerId IS NULL OR p.customer.id = :customerId) " +
            "AND (:status IS NULL OR p.status = :status) " +
            "AND (:startDate IS NULL OR p.date >= :startDate) " +
            "AND (:endDate IS NULL OR p.date <= :endDate) " +
            "AND (:searchPattern IS NULL OR (" +
            "   LOWER(p.number) LIKE :searchPattern OR " +
            "   LOWER(c.name) LIKE :searchPattern OR " +
            "   LOWER(c.code) LIKE :searchPattern OR " +
            "   LOWER(p.notes) LIKE :searchPattern" +
            "))")
    Page<Penawaran> findWithFilters(
            @Param("searchPattern") String searchPattern,
            @Param("customerId") Long customerId,
            @Param("status") PenawaranStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );
}
