#!/bin/bash
find . -name "*.tsx" -exec sed -i 's/Number(u.manual_approved_count) || Number(u.total_submitted) || 0/u.manual_approved_count !== undefined ? Number(u.manual_approved_count) : (Number(u.total_submitted) || 0)/g' {} +
find . -name "*.tsx" -exec sed -i 's/Number(item.manual_approved_count) || Number(item.total_submitted) || 0/item.manual_approved_count !== undefined ? Number(item.manual_approved_count) : (Number(item.total_submitted) || 0)/g' {} +
find . -name "*.tsx" -exec sed -i 's/Number(seller.manual_approved_count) || Number(seller.total_submitted) || 0/seller.manual_approved_count !== undefined ? Number(seller.manual_approved_count) : (Number(seller.total_submitted) || 0)/g' {} +
find . -name "*.tsx" -exec sed -i 's/Number(s.manual_approved_count) || Number(s.total_submitted) || 0/s.manual_approved_count !== undefined ? Number(s.manual_approved_count) : (Number(s.total_submitted) || 0)/g' {} +
