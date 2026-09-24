package com.andara.erp.repository;

import com.andara.erp.entity.KegiatanItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KegiatanItemRepository extends JpaRepository<KegiatanItem, Long> {

    List<KegiatanItem> findByKegiatanIdOrderBySortOrderAscIdAsc(Long kegiatanId);
}
