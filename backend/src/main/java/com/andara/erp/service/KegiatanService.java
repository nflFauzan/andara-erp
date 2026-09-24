package com.andara.erp.service;

import com.andara.erp.common.exception.AppException;
import com.andara.erp.common.exception.ErrorCode;
import com.andara.erp.dto.kegiatan.*;
import com.andara.erp.entity.Customer;
import com.andara.erp.entity.Kegiatan;
import com.andara.erp.entity.KegiatanItem;
import com.andara.erp.entity.KegiatanStatus;
import com.andara.erp.repository.CustomerRepository;
import com.andara.erp.repository.KegiatanItemRepository;
import com.andara.erp.repository.KegiatanRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class KegiatanService {

    private final KegiatanRepository kegiatanRepository;
    private final KegiatanItemRepository kegiatanItemRepository;
    private final CustomerRepository customerRepository;

    public KegiatanService(
            KegiatanRepository kegiatanRepository,
            KegiatanItemRepository kegiatanItemRepository,
            CustomerRepository customerRepository
    ) {
        this.kegiatanRepository = kegiatanRepository;
        this.kegiatanItemRepository = kegiatanItemRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public Page<KegiatanDTO> getKegiatan(
            String search,
            Long customerId,
            KegiatanStatus status,
            Pageable pageable
    ) {
        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;
        Page<Kegiatan> page = kegiatanRepository.findWithFilters(searchPattern, customerId, status, pageable);
        return page.map(k -> KegiatanDTO.fromEntity(k, false));
    }

    @Transactional(readOnly = true)
    public KegiatanDTO getKegiatanById(Long id) {
        Kegiatan kegiatan = findKegiatanOrThrow(id);
        return KegiatanDTO.fromEntity(kegiatan, true);
    }

    @Transactional(readOnly = true)
    public List<KegiatanDTO> getKegiatanByCustomer(Long customerId) {
        return kegiatanRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(k -> KegiatanDTO.fromEntity(k, true))
                .collect(Collectors.toList());
    }

    @Transactional
    public KegiatanDTO createKegiatan(CreateKegiatanRequest request, String username) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan"));

        String cleanCode = request.getCode().trim().toUpperCase();
        if (kegiatanRepository.existsByCode(cleanCode)) {
            throw new AppException(ErrorCode.CONFLICT, "Kode kegiatan '" + cleanCode + "' sudah terdaftar.");
        }

        Kegiatan kegiatan = new Kegiatan();
        kegiatan.setCustomer(customer);
        kegiatan.setCode(cleanCode);
        kegiatan.setName(request.getName().trim());
        kegiatan.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        kegiatan.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        kegiatan.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        kegiatan.setStatus(request.getStatus() != null ? request.getStatus() : KegiatanStatus.ACTIVE);
        kegiatan.setCreatedBy(username);
        kegiatan.setUpdatedBy(username);

        BigDecimal runningTotal = BigDecimal.ZERO;

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            int order = 1;
            for (KegiatanItemRequest itemReq : request.getItems()) {
                KegiatanItem item = new KegiatanItem();
                item.setDescription(itemReq.getDescription().trim());
                item.setVolume(itemReq.getVolume());
                item.setUnit(itemReq.getUnit().trim());
                item.setUnitPrice(itemReq.getUnitPrice());

                // Authoritative backend calculation: subtotal = volume * unitPrice
                BigDecimal subtotal = itemReq.getVolume()
                        .multiply(itemReq.getUnitPrice())
                        .setScale(2, RoundingMode.HALF_UP);
                item.setSubtotal(subtotal);
                item.setSortOrder(itemReq.getSortOrder() != null && itemReq.getSortOrder() > 0 ? itemReq.getSortOrder() : order++);
                item.setNotes(itemReq.getNotes() != null ? itemReq.getNotes().trim() : null);
                item.setCreatedBy(username);
                item.setUpdatedBy(username);

                kegiatan.addItem(item);
                runningTotal = runningTotal.add(subtotal);
            }
        }

        kegiatan.setTotalAmount(runningTotal);
        Kegiatan saved = kegiatanRepository.save(kegiatan);
        return KegiatanDTO.fromEntity(saved, true);
    }

    @Transactional
    public KegiatanDTO updateKegiatan(Long id, UpdateKegiatanRequest request, String username) {
        Kegiatan kegiatan = findKegiatanOrThrow(id);

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan"));

        kegiatan.setCustomer(customer);
        kegiatan.setName(request.getName().trim());
        kegiatan.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        kegiatan.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        kegiatan.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        kegiatan.setStatus(request.getStatus());
        kegiatan.setUpdatedBy(username);

        Kegiatan saved = kegiatanRepository.save(kegiatan);
        return KegiatanDTO.fromEntity(saved, true);
    }

    @Transactional
    public KegiatanDTO updateStatus(Long id, KegiatanStatus status, String username) {
        Kegiatan kegiatan = findKegiatanOrThrow(id);
        kegiatan.setStatus(status);
        kegiatan.setUpdatedBy(username);
        Kegiatan saved = kegiatanRepository.save(kegiatan);
        return KegiatanDTO.fromEntity(saved, true);
    }

    @Transactional
    public void deleteKegiatan(Long id) {
        Kegiatan kegiatan = findKegiatanOrThrow(id);
        // Financial rule: cascade removal of items is defined in DB/JPA
        kegiatanRepository.delete(kegiatan);
    }

    @Transactional
    public KegiatanItemDTO addItem(Long kegiatanId, KegiatanItemRequest request, String username) {
        Kegiatan kegiatan = findKegiatanOrThrow(kegiatanId);

        KegiatanItem item = new KegiatanItem();
        item.setDescription(request.getDescription().trim());
        item.setVolume(request.getVolume());
        item.setUnit(request.getUnit().trim());
        item.setUnitPrice(request.getUnitPrice());

        // Authoritative calculation
        BigDecimal subtotal = request.getVolume()
                .multiply(request.getUnitPrice())
                .setScale(2, RoundingMode.HALF_UP);
        item.setSubtotal(subtotal);

        int nextOrder = kegiatan.getItems().size() + 1;
        item.setSortOrder(request.getSortOrder() != null && request.getSortOrder() > 0 ? request.getSortOrder() : nextOrder);
        item.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        item.setCreatedBy(username);
        item.setUpdatedBy(username);

        kegiatan.addItem(item);
        recalculateKegiatanTotal(kegiatan);

        kegiatanRepository.save(kegiatan);
        return KegiatanItemDTO.fromEntity(item);
    }

    @Transactional
    public KegiatanItemDTO updateItem(Long kegiatanId, Long itemId, KegiatanItemRequest request, String username) {
        Kegiatan kegiatan = findKegiatanOrThrow(kegiatanId);

        KegiatanItem item = kegiatan.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.KEGIATAN_ITEM_NOT_FOUND, "Item kegiatan tidak ditemukan"));

        item.setDescription(request.getDescription().trim());
        item.setVolume(request.getVolume());
        item.setUnit(request.getUnit().trim());
        item.setUnitPrice(request.getUnitPrice());

        // Authoritative calculation
        BigDecimal subtotal = request.getVolume()
                .multiply(request.getUnitPrice())
                .setScale(2, RoundingMode.HALF_UP);
        item.setSubtotal(subtotal);

        if (request.getSortOrder() != null) {
            item.setSortOrder(request.getSortOrder());
        }
        item.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        item.setUpdatedBy(username);

        recalculateKegiatanTotal(kegiatan);
        kegiatanRepository.save(kegiatan);

        return KegiatanItemDTO.fromEntity(item);
    }

    @Transactional
    public void deleteItem(Long kegiatanId, Long itemId, String username) {
        Kegiatan kegiatan = findKegiatanOrThrow(kegiatanId);

        KegiatanItem item = kegiatan.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.KEGIATAN_ITEM_NOT_FOUND, "Item kegiatan tidak ditemukan"));

        kegiatan.removeItem(item);
        kegiatan.setUpdatedBy(username);
        recalculateKegiatanTotal(kegiatan);

        kegiatanRepository.save(kegiatan);
    }

    private void recalculateKegiatanTotal(Kegiatan kegiatan) {
        BigDecimal sum = kegiatan.getItems().stream()
                .map(KegiatanItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        kegiatan.setTotalAmount(sum);
    }

    private Kegiatan findKegiatanOrThrow(Long id) {
        return kegiatanRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.KEGIATAN_NOT_FOUND, "Kegiatan dengan ID " + id + " tidak ditemukan"));
    }
}
