import type { MouseEvent } from 'react';
import type { OrderCard as Order } from '../api';
import { navigate } from '../router';
import { formatDate, formatMoney, formatPallets, STATUS_LABELS, SUBTYPE_LABELS, TYPE_LABELS } from '../format';

function RefNumbers({ order }: { order: Order }) {
  if (order.subOrders.length === 0) {
    return (
      <span className="ref">
        <span className="ref-label">Ref N:</span> {order.refNumber ?? '—'}
      </span>
    );
  }

  return (
    <details className="ref-list">
      <summary>
        <span className="ref-label">Ref N</span> {order.subOrders.length} refs
      </summary>
      {order.subOrders.map((sub) => (
        <div key={sub.number} className="ref-item">
          <span className="ref-sub">{sub.number}</span>
          <span className="ref-value">{sub.refNumber ?? '—'}</span>
          <span>
            {sub.declaredQty} pallets
            {sub.alert && <em className="text-alert"> · ⚠ {sub.alert}</em>}
          </span>
        </div>
      ))}
    </details>
  );
}

function CreatedBy({ value }: { value: string }) {
  const [name, role] = value.split(' · ');
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('');

  return (
    <div className="created-by">
      by <span className="avatar">{initials}</span>
      <strong>{name}</strong>
      {role && <span className="role">{role}</span>}
    </div>
  );
}

function Quantity({ order }: { order: Order }) {
  if (order.actualQty !== null && order.actualQty !== order.declaredQty) {
    return (
      <>
        {order.declaredQty} decl · <span className="text-warning">{order.actualQty} actual</span>
      </>
    );
  }
  return <>{formatPallets(order)}</>;
}

function Footer({ order }: { order: Order }) {
  if (order.status === 'completed') {
    return (
      <div className="card-footer">
        Paid · {formatMoney(order.totalCents)}
        {order.invoiceNumber && <span className="link"> · #{order.invoiceNumber}</span>}
      </div>
    );
  }
  if (order.hasAlert) {
    return <div className="card-footer text-alert">⚠ Next: {order.nextAction ?? order.alert}</div>;
  }
  return <div className="card-footer">Next: {order.nextAction ?? '—'}</div>;
}

export function OrderCard({ order, isNew = false }: { order: Order; isNew?: boolean }) {
  const isConsolidation = order.type === 'consolidation';
  const typeLine = isConsolidation
    ? `${TYPE_LABELS[order.type]} · ${order.subOrders.length} sub-orders`
    : `${TYPE_LABELS[order.type]}${order.subtype ? ` · ${SUBTYPE_LABELS[order.subtype]}` : ''}`;

  function handleClick(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('details')) return;
    navigate(`/orders/${order.number}`);
  }

  return (
    <div className={`order-card${order.hasAlert ? ' has-alert' : ''}${isNew ? ' is-new' : ''}`} onClick={handleClick}>
      <div className="card-head">
        <div>
          <div className="card-id">
            <span className="order-number">{order.number}</span>
            <RefNumbers order={order} />
            {isNew && <span className="new-label">✨ Just generated</span>}
          </div>
          <div className="muted">{typeLine}</div>
          <CreatedBy value={order.createdBy} />
        </div>
        <div className="badges">
          <span className={`badge badge-${order.type}`}>{TYPE_LABELS[order.type]}</span>
          <span className={`badge badge-${order.status}`}>{STATUS_LABELS[order.status]}</span>
          {order.hasAlert && <span className="badge badge-alert">Alert</span>}
        </div>
      </div>

      <div className="card-fields">
        <div>
          <div className="muted">Hub</div>
          <strong>{order.hub.name}</strong>
        </div>
        <div>
          <div className="muted">Date</div>
          <strong>{formatDate(order.date)}</strong>
        </div>
        <div>
          <div className="muted">Q-ty</div>
          <strong>
            <Quantity order={order} />
          </strong>
        </div>
        <div>
          <div className="muted">Carrier</div>
          <strong>{order.carrier ?? 'Self pickup'}</strong>
        </div>
        <div>
          <div className="muted">Destination</div>
          <strong>{order.destination ?? '—'}</strong>
        </div>
        {isConsolidation && (
          <div>
            <div className="muted">Trailers</div>
            <span className="trailers">{order.trailers} consolidated</span>
          </div>
        )}
      </div>

      <Footer order={order} />
    </div>
  );
}
