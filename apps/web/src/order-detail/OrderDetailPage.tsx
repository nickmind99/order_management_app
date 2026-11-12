import { Fragment, type ReactNode } from 'react';
import { useApi, type OrderDetail } from '../api';
import { formatDate, formatMoney, STATUS_LABELS, SUBTYPE_LABELS, TYPE_LABELS } from '../format';
import { Link } from '../router';
import { statusSteps } from './status-steps';

const PALLET_LABELS = { std: 'Standard (48×40)', xl: 'XL' };
const OPERATION_LABELS = { unloading: 'Unloading', disposal: 'Disposal', restack: 'Restack', loading: 'Loading' };
const CATEGORY_LABELS = { securement: 'Securement', edge_protect: 'Edge protect', wrap: 'Wrap' };

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{children ?? '—'}</dd>
    </>
  );
}

function StatusFlow({ order }: { order: OrderDetail }) {
  return (
    <span className="status-flow">
      {statusSteps(order.status).map((step, i) => (
        <Fragment key={step.status}>
          {i > 0 && ' → '}
          <span className={`step-${step.state}`}>{STATUS_LABELS[step.status]}</span>
        </Fragment>
      ))}
    </span>
  );
}

function Delta({ delta }: { delta: number | null }) {
  if (!delta) return null;
  return <span className="badge badge-alert">Δ {delta > 0 ? `+${delta}` : delta}</span>;
}

function Header({ order }: { order: OrderDetail }) {
  return (
    <div className="detail-header">
      <Link to="/orders" className="btn btn-secondary">
        ←
      </Link>
      <span className="muted">Order#:</span>
      <strong className="order-number">{order.number}</strong>
      <span className={`badge badge-${order.type}`}>
        {TYPE_LABELS[order.type]}
        {order.subtype && ` · ${SUBTYPE_LABELS[order.subtype]}`}
      </span>
      <span className={`badge badge-${order.status}`}>{STATUS_LABELS[order.status]}</span>
      {order.refNumber && (
        <span className="ref">
          <span className="ref-label">Ref N:</span> {order.refNumber}
        </span>
      )}
      <span className="muted">by {order.createdBy}</span>
      {order.delta !== null && order.delta !== 0 && <span className="badge badge-alert">⚠ Actual ≠ Expected</span>}
    </div>
  );
}

function Meta({ order }: { order: OrderDetail }) {
  return (
    <div className="panel meta">
      <dl>
        <Field label="Customer">{order.customer}</Field>
        <Field label="Hub">
          {order.hub.name} ({order.hub.region})
        </Field>
        <Field label="Services">
          {order.services.map((service) => (
            <span key={service} className="badge badge-service">
              {service}
            </span>
          ))}
        </Field>
        <Field label="Date">{formatDate(order.date)}</Field>
        <Field label="Destination">{order.destination}</Field>
        <Field label="Declared q-ty">
          {order.declaredQty} <span className="muted">{unitLabel(order)}</span>
        </Field>
        <Field label="Actual q-ty">
          {order.actualQty ?? 'not counted yet'} <Delta delta={order.delta} />
        </Field>
      </dl>
      <dl>
        <Field label="Carrier">{order.carrier?.name ?? 'Self pickup'}</Field>
        <Field label="Phone">{order.carrier?.phone}</Field>
        <Field label="Truck / trailer">
          {order.truck && `${order.truck.number} / ${order.truck.trailerNumber} · ${order.truck.trailerType}`}
        </Field>
        <Field label="Dock">{order.dock && `Dock ${order.dock.number} · Bay ${order.dock.bay}`}</Field>
        <Field label="Assigned to">{order.assignedTo}</Field>
        <Field label="Status flow">
          <StatusFlow order={order} />
        </Field>
        <Field label="Next action">{order.nextAction}</Field>
      </dl>
    </div>
  );
}

function unitLabel(order: OrderDetail): string {
  return order.subOrders.length > 0 ? `in ${order.subOrders.length} sub-orders` : PALLET_LABELS[order.palletType];
}

function DockMap({ order }: { order: OrderDetail }) {
  if (!order.dock) return null;
  const docks = [order.dock.number - 1, order.dock.number, order.dock.number + 1];

  return (
    <div className="panel dock-card">
      <div className="kpi-label">Your assigned dock</div>
      <div className="dock-map">
        <div className="dock-wall">{order.hub.name} hub</div>
        <div className="docks">
          {docks.map((number) => (
            <div key={number} className={number === order.dock?.number ? 'dock current' : 'dock'}>
              {number === order.dock?.number ? `Dock ${number}` : number}
            </div>
          ))}
        </div>
        {order.truck && <div className="trailer">🚚 {order.truck.trailerNumber}</div>}
      </div>
      <strong>
        Dock {order.dock.number} · Bay {order.dock.bay}
      </strong>
    </div>
  );
}

function Quantities({ order }: { order: OrderDetail }) {
  return (
    <div className="qty-row">
      <DockMap order={order} />
      <div className="panel qty-card">
        <div className="kpi-label">Expected (BOL)</div>
        <div className="kpi-value">{order.declaredQty}</div>
        <div className="muted">{unitLabel(order)}</div>
      </div>
      <div className="panel qty-card">
        <div className="kpi-label">Actual (warehouse)</div>
        <div className="kpi-value">
          {order.actualQty ?? '—'} <Delta delta={order.delta} />
        </div>
        <div className="muted">Delta from BOL · read-only</div>
      </div>
      <div className="panel qty-card">
        <div className="kpi-label">Warehouse note</div>
        <p>{order.warehouseNote ?? '—'}</p>
      </div>
    </div>
  );
}

function SubOrders({ order }: { order: OrderDetail }) {
  if (order.subOrders.length === 0) return null;

  return (
    <section className="panel">
      <h2>Sub-orders</h2>
      <table>
        <thead>
          <tr>
            <th>Sub-order</th>
            <th>Ref N</th>
            <th>Status</th>
            <th>Unit</th>
            <th>Declared</th>
            <th>Actual</th>
            <th>Trailer</th>
          </tr>
        </thead>
        <tbody>
          {order.subOrders.map((sub) => (
            <tr key={sub.number}>
              <td className="order-number">{sub.number}</td>
              <td className="ref">{sub.refNumber ?? '—'}</td>
              <td>
                <span className={`badge badge-${sub.status}`}>{STATUS_LABELS[sub.status]}</span>
                {sub.alert && <span className="text-alert"> ⚠ {sub.alert}</span>}
              </td>
              <td>{PALLET_LABELS[sub.palletType]}</td>
              <td>{sub.declaredQty}</td>
              <td>{sub.actualQty ?? '—'}</td>
              <td>{sub.trailerNumber ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Operations({ order }: { order: OrderDetail }) {
  return (
    <section className="panel">
      <h2>Operations</h2>
      {order.operations.length === 0 ? (
        <p className="muted">No operations yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Operation</th>
              <th>Trailer</th>
              <th>Q-ty</th>
              <th>Unit</th>
              <th>Applied at</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.operations.map((op) => (
              <tr key={op.id}>
                <td>{OPERATION_LABELS[op.type]}</td>
                <td>{op.trailerNumber ?? '—'}</td>
                <td>{op.qty}</td>
                <td>{PALLET_LABELS[op.palletType]}</td>
                <td>{formatDate(op.appliedAt)}</td>
                <td>{op.priceCents === null ? '—' : formatMoney(op.priceCents)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5}>Operations total</td>
              <td>{formatMoney(order.operationsTotalCents)}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </section>
  );
}

function Supplies({ order }: { order: OrderDetail }) {
  return (
    <section className="panel">
      <h2>Supplies</h2>
      {order.supplies.length === 0 ? (
        <p className="muted">No supplies</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Category</th>
              <th>Q-ty</th>
              <th>Unit $</th>
              <th>Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.supplies.map((supply) => (
              <tr key={supply.id}>
                <td>{supply.sku}</td>
                <td>
                  <span className="badge badge-service">{CATEGORY_LABELS[supply.category]}</span>
                </td>
                <td>{supply.qty}</td>
                <td>{formatMoney(supply.unitPriceCents)}</td>
                <td>{formatMoney(supply.lineTotalCents)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}>Supply subtotal</td>
              <td>{formatMoney(order.suppliesSubtotalCents)}</td>
            </tr>
          </tfoot>
        </table>
      )}
      <div className="order-total">
        Order total: <strong>{formatMoney(order.totalCents)}</strong>
        {order.invoiceNumber && <span className="muted"> · invoice #{order.invoiceNumber}</span>}
      </div>
    </section>
  );
}

export function OrderDetailPage({ number }: { number: string }) {
  const { data: order, loading } = useApi<OrderDetail>(`/orders/${encodeURIComponent(number)}`);

  return (
    <>
      <div className="crumbs">
        <Link to="/orders">Orders</Link> <span>›</span> {number}
      </div>
      {loading && <p className="muted">Loading…</p>}
      {order && (
        <>
          <Header order={order} />
          {order.alert && <div className="banner banner-alert">⚠ {order.alert}</div>}
          {order.warning && <div className="banner banner-warning">⚠ {order.warning}</div>}
          <Meta order={order} />
          <Quantities order={order} />
          <SubOrders order={order} />
          <Operations order={order} />
          <Supplies order={order} />
        </>
      )}
    </>
  );
}
