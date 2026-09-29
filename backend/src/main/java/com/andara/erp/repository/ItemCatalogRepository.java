package com.andara.erp.repository;

import com.andara.erp.entity.ItemCatalog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemCatalogRepository extends JpaRepository<ItemCatalog, Long> {

    Optional<ItemCatalog> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    @Query("SELECT i FROM ItemCatalog i WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " (i.code IS NOT NULL AND LOWER(i.code) LIKE LOWER(CONCAT('%', :search, '%'))) OR " +
           " (i.description IS NOT NULL AND LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')))) AND " +
           "(:category IS NULL OR :category = '' OR i.category = :category) AND " +
           "(:isActive IS NULL OR i.isActive = :isActive)")
    Page<ItemCatalog> searchItems(
            @Param("search") String search,
            @Param("category") String category,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );

    List<ItemCatalog> findByIsActiveTrueOrderByNameAsc();

    @Query("SELECT DISTINCT i.category FROM ItemCatalog i WHERE i.category IS NOT NULL AND i.category <> '' ORDER BY i.category ASC")
    List<String> findDistinctCategories();

    long countByIsActiveTrue();
}
