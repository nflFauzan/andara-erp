package com.andara.erp.repository;

import com.andara.erp.entity.PenawaranDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PenawaranDetailRepository extends JpaRepository<PenawaranDetail, Long> {

    List<PenawaranDetail> findByPenawaranIdOrderBySortOrderAscIdAsc(Long penawaranId);

    List<PenawaranDetail> findByKegiatanId(Long kegiatanId);

    List<PenawaranDetail> findByKegiatanItemId(Long kegiatanItemId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT d.penawaran FROM PenawaranDetail d WHERE d.kegiatan.id = :kegiatanId ORDER BY d.penawaran.date DESC")
    List<com.andara.erp.entity.Penawaran> findPenawaranByKegiatanId(@org.springframework.data.repository.query.Param("kegiatanId") Long kegiatanId);
}
