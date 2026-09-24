package com.andara.erp.repository;

import com.andara.erp.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByCode(String code);

    Optional<Customer> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    @Query("SELECT c FROM Customer c WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.picName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:isActive IS NULL OR c.isActive = :isActive)")
    Page<Customer> searchCustomers(
            @Param("search") String search,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );

    List<Customer> findByIsActiveTrueOrderByNameAsc();
}
