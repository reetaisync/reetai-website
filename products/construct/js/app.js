const builder = new URLSearchParams(window.location.search).get('builder');


function getStatusPill(status){

    let cls = '';

    if(status === 'Approved'){
        cls = 'status-approved';
    }

    if(status === 'Pending'){
        cls = 'status-pending';
    }

    if(status === 'Open'){
        cls = 'status-open';
    }

    if(status === 'Paid'){
        cls = 'status-paid';
    }

    if(status === 'Closed'){
        cls = 'status-closed';
    }

    return `
    <span class="status-pill ${cls}">
        ${status}
    </span>
    `;
}
async function saveProject(){

    const name =
    document.getElementById('projectName').value;

    const budget =
    document.getElementById('projectBudget').value;
    
    const response = await fetch('/api/projects',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            builder,
            name,
            budget
        })
    });

    const data = await response.json();

    if(!response.ok){

        document.getElementById('message').innerHTML =
        `<span style="color:red">${data.error}</span>`;

        return;
    }

    document.getElementById('message').innerHTML =
    '<span style="color:green">✅ Project Created Successfully</span>';

    setTimeout(()=>{
        document.getElementById('message').innerHTML='';
    },3000);

    document.getElementById('projectName').value='';
    document.getElementById('projectBudget').value='';

    await loadProjects();
}

async function deleteProject(id){

    console.log('Deleting:', id);

    if(!confirm('Delete this project?')){
        return;
    }

    const res = await fetch(
        '/api/projects/' + id,
        {
            method:'DELETE'
        }
    );

    console.log(await res.text());

    await loadProjects();
}

async function loadProjects(){

    const res =
    await fetch('/api/projects?builder=' + builder);

    const data =
    await res.json();

    document.getElementById(
    'projectCount'
    ).innerText = data.length;

    let html = '';

    data.forEach(project=>{

       html += `
        <div class="record">
            <div>
                <b>${project.name}</b>
            </div>
            <div>
                ₹${Number(project.budget).toLocaleString('en-IN')}
            </div>
            <div>
                <button onclick="deleteProject(${project.id})">
                    Delete
                </button>
            </div>
        </div>
        `;
    });

    document.getElementById(
    'projects'
    ).innerHTML = html;

    // Populate dropdown

    const dropdown =
    document.getElementById('prProject');

    let options = '';

    data.forEach(project=>{

        options += `
        <option value="${project.id}">
            ${project.name}
        </option>
        `;

    });

    dropdown.innerHTML = options;

}

async function loadPRs(){

    const res = await fetch('/api/purchase-requests?builder=' + builder);
    const data = await res.json();
    
    let html = '';

    data.forEach(pr=>{

        html += `
    <div class="record">

        <div><b>${pr.material}</b></div>
        <div>₹${Number(pr.amount).toLocaleString('en-IN')}</div>
        <div>${getStatusPill(pr.status)}</div>
        ${
            pr.status === 'Pending'
            ? `
            <button onclick="approvePR(${pr.id})">
                Approve
            </button>

            <button onclick="rejectPR(${pr.id})">
                Reject
            </button>
            `
            : ''
        }

    </div>
    `;

    });

    document.getElementById(
        'prList'
    ).innerHTML = html;

}

async function createPR(){

    const project_id =document.getElementById('prProject').value;

    const material =document.getElementById('material').value;
    const amount =document.getElementById('amount').value;

    // Validation
    if (!material.trim()) {
        alert('Please enter Material');
        return;
    }

    if (!amount || Number(amount) <= 0) {
        alert('Please enter a valid Amount');
        return;
    }
    
    const response = await fetch(
        '/api/purchase-requests',
        {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                builder,
                project_id,
                material,
                amount
            })
        }
    );

    const data = await response.json();

    if(!response.ok){
        alert(data.error);
        return;
    }
    document.getElementById('material').value = '';
    document.getElementById('amount').value = '';
    await loadPRs();

}
async function loadVendors(){

    
    const res = await fetch('/api/vendors?builder=' + builder);

    const data = await res.json();

    let html = '';

    data.forEach(vendor => {

        html += `
        <div class="record">
        <div>
            <b>${vendor.name}</b>
        </div>
        <div>
            ${vendor.phone}
        </div>
        <div>
            ${vendor.email}
            <br>
            GST: ${vendor.gst}
        </div>
        </div>
        `;

    });

    document.getElementById(
        'vendorList'
    ).innerHTML = html;

}
async function createVendor(){

    const name = document.getElementById('vendorName').value;
    const phone = document.getElementById('vendorPhone').value;
    const email = document.getElementById('vendorEmail').value;
    const gst = document.getElementById('vendorGST').value;
    

    const response = await fetch(
        '/api/vendors',
        {
            method:'POST',

            headers:{
                'Content-Type':'application/json'
            },

            body:JSON.stringify({
                builder,
                name,
                phone,
                email,
                gst
            })
        }
    );
    const data = await response.json();

    if(!response.ok){
        alert(data.error);
        return;
    }

    document.getElementById('vendorName').value = '';
    document.getElementById('vendorPhone').value = '';
    document.getElementById('vendorEmail').value = '';
    document.getElementById('vendorGST').value = '';

    await loadVendors();
    await loadPOVendors();

}
async function approvePR(id){

 const response = await fetch(
   `/api/purchase-requests/${id}/approve`,
   {
      method:'PUT'
   }
 );

 await loadPRs();
 await loadPOPRs();

}

async function rejectPR(id){

 const response = await fetch(
   `/api/purchase-requests/${id}/reject`,
   {
      method:'PUT'
   }
 );

 await loadPRs();

}

async function loadPOPRs(){

    const res = await fetch(`/api/purchase-requests/available?builder=${builder}`);
    const prs = await res.json();

    let options = '';

    prs.forEach(pr=>{

        options += `
        <option value="${pr.id}">
            ${pr.material} - ₹${pr.amount}
        </option>
        `;

    });

    if (options === '') {
        options = '<option>No Approved PRs</option>';
    }
    document.getElementById('poPR').innerHTML = options;

}

async function loadPOVendors(){

    const res = await fetch('/api/vendors?builder=' + builder);
    const vendors = await res.json();

    let options = '';

    vendors.forEach(vendor => {

        options += `
        <option value="${vendor.id}">
            ${vendor.name}
        </option>
        `;

    });

    document.getElementById(
        'poVendor'
    ).innerHTML = options;

}

async function createPO(){

    const pr_id = document.getElementById('poPR').value;
    const vendor_id =document.getElementById('poVendor').value;
    

    const prs =await (await fetch('/api/purchase-requests?builder=' + builder)).json();

    const pr =prs.find(
        p => p.id == pr_id
    );

    const res = await fetch(
        '/api/purchase-orders',
        {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                builder,
                pr_id,
                vendor_id,
                amount:pr.amount
            })
        }
    );

    const data = await res.json();

    if(!res.ok){
        alert(data.error);
        return;
    }
    alert('PO Created: ' + data.po_number);
    await refreshAll();

}

async function loadPOs(){

    const res = await fetch('/api/purchase-orders?builder=' + builder);

    const data = await res.json();

    let html = '';
    
    data.forEach(po => {
        html += `
        <div class="record">
        <div>
            <b>${po.po_number}</b>
        </div>
        <div>
            ₹${Number(po.amount).toLocaleString('en-IN')}
        </div>
        <div>
            ${getStatusPill(po.status)}
        </div>
        </div>
        `;
    });

    document.getElementById(
        'poList'
    ).innerHTML = html;

    // Populate Invoice PO dropdown

    const invoiceDropdown =
    document.getElementById('invoicePO');

    let invoiceOptions = '';

    data
    .filter(po => po.status === 'Open')
    .forEach(po=>{
        invoiceOptions += `
        <option value="${po.id}">
            ${po.po_number}
        </option>
        `;
    });

    if(invoiceDropdown){
        invoiceDropdown.innerHTML =
        invoiceOptions;
    }

}

async function loadGRNPOs(){

    const res = await fetch('/api/purchase-orders?builder=' + builder);

    const pos =
    await res.json();

    let options = '';

    pos
    .filter(po => po.status === 'Open')
    .forEach(po=>{

        options += `
        <option value="${po.id}">
            ${po.po_number}
        </option>
        `;

    });

    document.getElementById(
        'grnPO'
    ).innerHTML = options;

}

async function createGRN(){

    const po_id = document.getElementById('grnPO').value;

    const quantity_received = document.getElementById('grnQty').value;

    const remarks = document.getElementById('grnRemarks').value;
    
    const response = await fetch(
        `/api/goods-receipts?builder=${builder}`,
        {
            method:'POST',

            headers:{
                'Content-Type':'application/json'
            },

            body:JSON.stringify({
                builder,
                po_id,
                quantity_received,
                remarks
            })
        }
    );
    const data = await response.json();

    if(!response.ok){
        alert(data.error);
        return;
    }

    document.getElementById(
        'grnQty'
    ).value = '';

    document.getElementById(
        'grnRemarks'
    ).value = '';

    await loadGRNs();
    await loadInvoices();

}
async function loadGRNs(){

    const res = await fetch('/api/goods-receipts?builder=' + builder);

    const data =
    await res.json();

    let html = '';

    data.forEach(grn=>{

        html += `
        <div class="record">
            <div>
                <b>GRN-${grn.id}</b>
            </div>
            <div>
                Qty: ${grn.quantity_received}
            </div>
            <div>
                ${grn.status}
            </div>
        </div>
        `;
    });

    document.getElementById(
        'grnList'
    ).innerHTML = html;

}

async function createInvoice(){

    const po_id = document.getElementById('invoicePO').value;
        
    const response = await fetch(
        '/api/invoices',
        {
            method:'POST',

            headers:{
                'Content-Type':'application/json'
            },

            body:JSON.stringify({
                builder,
                po_id
            })
        }
    );
    const data = await response.json();

    if(!response.ok){
        alert(data.error);
        return;
    }

    await loadInvoices();
    await loadPaymentInvoices();

}

async function loadInvoices(){

    const res = await fetch('/api/invoices?builder=' + builder);

    const data = await res.json();

    let html = '';

    data.forEach(inv=>{

        html += `
        <div class="record">

            <div>
                <b>${inv.invoice_number}</b>
            </div>

            <div>
                ₹${Number(inv.amount).toLocaleString('en-IN')}
            </div>

            <div>
                ${getStatusPill(inv.status)}
            </div>

        </div>
        `;

    });

    document.getElementById(
        'invoiceList'
    ).innerHTML = html;

}

async function loadPaymentInvoices(){

    const res = await fetch('/api/invoices?builder=' + builder);

    const invoices =
    await res.json();

    let options = '';

    invoices
    .filter(inv => inv.status === 'Pending')
    .forEach(inv=>{

        options += `
        <option value="${inv.id}">
            ${inv.invoice_number}
        </option>
        `;

    });

    document.getElementById(
        'paymentInvoice'
    ).innerHTML = options;

}
async function createPayment(){

    const invoice_id = document.getElementById('paymentInvoice').value;

    const response =  await fetch(
        '/api/payments',
        {
            method:'POST',

            headers:{
                'Content-Type':'application/json'
            },

            body:JSON.stringify({
                builder,
                invoice_id
            })
        }
    );
    const data = await response.json();

    if(!response.ok){
        alert(data.error);
        return;
    }

    await loadPayments();
    await loadInvoices();
    await loadPOs();
    await loadGRNPOs();
    await loadPaymentInvoices();

}

async function loadPayments(){

    const res = await fetch('/api/payments?builder=' + builder);

    const data =
    await res.json();

    let html = '';

    data.forEach(payment=>{

        html += `
        <div class="record">

            <div>
                <b>${payment.payment_reference}</b>
            </div>

            <div>
                ₹${Number(payment.amount).toLocaleString('en-IN')}
            </div>

            <div>
                ${getStatusPill(payment.status)}
            </div>

        </div>
        `;

    });

    document.getElementById(
        'paymentList'
    ).innerHTML = html;

}

async function refreshAll(){

    await loadProjects();
    await loadPRs();
    await loadVendors();

    await loadPOPRs();
    await loadPOVendors();

    await loadPOs();

    await loadGRNPOs();
    await loadGRNs();

    await loadInvoices();
    await loadPaymentInvoices();

    await loadPayments();
}

refreshAll();