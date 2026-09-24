package com.andara.erp.repository;

import com.andara.erp.entity.Kegiatan;
import com.andara.erp.entity.KegiatanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KegiatanRepository extends JpaRepository<Kegiatan, Long> {

    Optional<Kegiatan> findByCode(String code);

    boolean existsByCode(String code);

    List<Kegiatan> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Kegiatan> findByCustomerIdAndStatus(Long customerId, KegiatanStatus status);

    long countByStatusIn(List<KegiatanStatus> statuses);

    long countByCustomerId(Long customerId);

    @Query("SELECT k FROM Kegiatan k " +
            "JOIN k.customer c " +
            "WHERE (:customerId IS NULL OR k.customer.id = :customerId) " +
            "AND (:status IS NULL OR k.status = :status) " +
            "AND (:searchPattern IS NULL OR (" +
            "   LOWER(k.code) LIKE :searchPattern OR " +
            "   LOWER(k.name) LIKE :searchPattern OR " +
            "   LOWER(k.location) LIKE :searchPattern OR " +
            "   LOWER(c.name) LIKE :searchPattern OR " +
            "   LOWER(c.code) LIKE :searchPattern" +
            "))")
    Page<Kegiatan> findWithFilters(
            @Param("searchPattern") String searchPattern,
            @Param("customerId") Long customerId,
            @Param("status") KegiatanStatus status,
            Pageable pageable
    );
}
