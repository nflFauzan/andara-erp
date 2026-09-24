package com.andara.erp.repository;

import com.andara.erp.entity.DepositTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepositTransactionRepository extends JpaRepository<DepositTransaction, Long> {

    Page<DepositTransaction> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);

    List<DepositTransaction> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<DepositTransaction> findFirstByCustomerIdOrderByCreatedAtDescIdDesc(Long customerId);

    @Query("SELECT COALESCE(SUM(CASE " +
            "WHEN dt.type = com.andara.erp.entity.DepositTransactionType.DEPOSIT_IN THEN dt.amount " +
            "WHEN dt.type = com.andara.erp.entity.DepositTransactionType.DEPOSIT_ADJUSTMENT THEN dt.amount " +
            "ELSE -dt.amount END), 0) " +
            "FROM DepositTransaction dt WHERE dt.customer.id = :customerId")
    BigDecimal calculateCurrentBalanceByCustomerId(@Param("customerId") Long customerId);
}
