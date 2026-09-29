package com.andara.erp.repository;

import com.andara.erp.entity.SphKegiatan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SphKegiatanRepository extends JpaRepository<SphKegiatan, Long> {

    List<SphKegiatan> findByPenawaranIdOrderBySortOrderAscIdAsc(Long penawaranId);

    void deleteByPenawaranId(Long penawaranId);
}
