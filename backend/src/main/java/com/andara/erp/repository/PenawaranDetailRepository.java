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
}
