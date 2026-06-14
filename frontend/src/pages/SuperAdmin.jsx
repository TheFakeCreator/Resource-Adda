import React from 'react'
import "./SuperAdmin.css"

export default function SuperAdmin() {
  return (
    <div>
      <div class="res-super">
        <div class="res-inner-super">
  
            <div>
                <label for="superadmin-password" class="text-super">Super Admin Password</label>
                <div class="input-container">
                    <input type="password" id="superadmin-password" class="admin-input password-field" placeholder="Enter Super Admin Password"/>
                </div>
            </div>


            <div>
                <label for="admin-username" class="text-super">Admin Username</label>
                <input type="text" id="admin-username" class="admin-input" placeholder="Enter Admin Username"/>
            </div>

            <div>
                <label for="admin-password" class="text-super">Admin Password</label>
                <div class="input-container">
                    <input type="password" id="admin-password" class="admin-input password-field" placeholder="Enter Admin Password"/>
                </div>
            </div>
        </div>
    </div>
      
    </div>
  )
}
